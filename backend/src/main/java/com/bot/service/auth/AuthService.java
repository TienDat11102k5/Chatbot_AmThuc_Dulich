package com.bot.service.auth;

import com.bot.controller.auth.dto.AuthResponse;
import com.bot.controller.auth.dto.LoginRequest;
import com.bot.controller.auth.dto.RegisterRequest;
import com.bot.entity.OtpToken;
import com.bot.entity.User;
import com.bot.repository.OtpTokenRepository;
import com.bot.repository.UserRepository;
import com.bot.service.email.EmailService;
import com.bot.service.email.EmailProducer;
import com.bot.security.JwtService;
import org.springframework.amqp.AmqpException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.Collections;

/**
 * Service xử lý toàn bộ logic nghiệp vụ về xác thực (Authentication),
 * đăng ký (Registration), đăng nhập (Login) và cấp lại mật khẩu.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    // EmailProducer: Thay thế gọi trực tiếp emailService.sendOtpEmail()
    // bằng cách đẩy yêu cầu vào RabbitMQ queue — không blocking
    private final EmailProducer emailProducer;

    @Value("${google.client.id}")
    private String googleClientId;

    /**
     * Đăng ký tài khoản người dùng mới vào hệ thống.
     * Quá trình bao gồm: kiểm tra trùng lặp thông tin, mã hóa mật khẩu, cấu hình đối tượng User,
     * lưu vào cơ sở dữ liệu và tự động sinh mã Token JWT trả về cho người dùng đăng nhập ngay lập tức.
     *
     * @param request DTO chứa thông tin đăng ký bao gồm username, email và password gốc.
     * @return AuthResponse chứa chuỗi JWT, username, email và quyền (role) của người dùng mới tạo.
     * @throws RuntimeException Nếu username hoặc email đã tồn tại trong hệ thống.
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Xử lý yêu cầu đăng ký cho username: {}", request.getUsername());
        
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại trong hệ thống");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        log.info("Creating new user...");
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        log.info("Saving user to database...");
        userRepository.save(user);
        log.info("User saved successfully");

        log.info("Generating JWT token...");
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole())
                .build();
        
        String token = jwtService.generateToken(userDetails);
        log.info("Token generated successfully");

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Xác thực thông tin đăng nhập của người dùng.
     * Hàm gọi AuthenticationManager để kiểm tra username và password thô. Nếu xác thực thành công,
     * đối tượng UserDetails sẽ được tạo ra để sinh chuỗi mã thông báo JWT truy cập hệ thống.
     *
     * @param request DTO chứa thông tin đăng nhập bao gồm username và password thô.
     * @return AuthResponse chứa chuỗi JWT, username, email và quyền (role) của người dùng.
     * @throws RuntimeException Nếu mật khẩu sai hoặc không tìm thấy thông tin trên database.
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Đang xử lý đăng nhập cho email: {}", request.getEmail());
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đăng nhập tương ứng"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole())
                .build();
        
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Xử lý luồng yêu cầu quên mật khẩu của người dùng.
     * Các bước:
     * 1. Kiểm tra sự tồn tại của email do người dùng cung cấp.
     * 2. Tạo mã OTP ngẫu nhiên 6 chữ số và xóa các mã OTP cũ (nếu có).
     * 3. Lưu OTP mới vào database lưu trạng thái và có hiệu lực thời hạn 5 phút.
     * 4. Gọi thư viện EmailService gửi một email cảnh báo đến hộp thư người dùng.
     *
     * @param email Địa chỉ email của tài khoản cần lấy lại mật khẩu.
     * @throws RuntimeException Nếu email không tồn tại trong hệ thống (User chưa đăng ký).
     */
    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(String email) {
        log.info("Process forgot password for email: {}", email);
        
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));
        
        // Tạo mã OTP ngẫu nhiên 6 chữ số
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        // Xóa OTP cũ nếu có
        otpTokenRepository.deleteByEmail(email);
        
        // Lưu OTP mới với thời hạn 5 phút
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(5))
                .build();
                
        otpTokenRepository.save(otpToken);
        
        // Gửi email OTP qua RabbitMQ (bất đồng bộ — không blocking)
        // Nếu RabbitMQ không khả dụng → fallback gửi đồng bộ trực tiếp
        // → Graceful Degradation: user luôn nhận được OTP dù queue có sập
        try {
            emailProducer.sendEmailRequest(email, otp);
            log.info("Đã đẩy yêu cầu gửi OTP vào queue cho: {}", email);
        } catch (AmqpException e) {
            log.warn("RabbitMQ không khả dụng — fallback gửi email đồng bộ cho: {}", email);
            emailService.sendOtpEmail(email, otp); // Fallback: gửi trực tiếp
        }
    }

    /**
     * Xác thực mã OTP và đặt lại mật khẩu mới cho người dùng.
     * Giao dịch (Transactional) đảm bảo nếu có lỗi, dữ liệu sẽ nguyên vẹn (rollback).
     * Quá trình:
     * - Kiểm tra mã OTP xem có khớp không và còn hạn không.
     * - Nếu hợp lệ, thuật toán sẽ mã hóa mật khẩu mới và cập nhật trạng thái trên database.
     * - Cuối cùng, xóa token OTP vừa dùng để tránh dùng lại (tấn công lặp).
     *
     * @param email Địa chỉ email của tài khoản yêu cầu.
     * @param otp Mã xác thực 6 chữ số người dùng lấy từ email.
     * @param newPassword Mật khẩu mới dạng thô (chưa được mã hóa/hashed).
     * @throws RuntimeException Nếu OTP sai, hết hạn hoặc email User không đúng.
     */
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        log.info("Process reset password for email: {}", email);
        
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ."));
                
        if (otpToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("Mã OTP đã hết hạn.");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User tương ứng."));
                
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Xóa token sau khi sử dụng xong
        otpTokenRepository.delete(otpToken);
        log.info("Password updated successfully for email: {}", email);
    }

    /**
     * Xác thực người dùng bằng Google Login.
     * Hỗ trợ xác thực bằng ID Token hoặc Access Token (từ custom button FE).
     * @param tokenStr Chuỗi JWT (ID Token) hoặc Access Token.
     * @return AuthResponse chứa access token của ứng dụng.
     */
    public AuthResponse googleLogin(String tokenStr) {
        try {
            String email;
            String name;
            String picture;

            // Nếu là ID Token (chuỗi JWT có 3 phần)
            if (tokenStr.split("\\.").length == 3) {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken token = verifier.verify(tokenStr);
                if (token == null) {
                    throw new RuntimeException("Mã xác thực Google không hợp lệ!");
                }
                GoogleIdToken.Payload payload = token.getPayload();
                email = payload.getEmail();
                name = (String) payload.get("name");
                picture = (String) payload.get("picture");
            } else {
                // Xử lý nhánh lấy Access Token từ Custom Button (implicit flow)
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(tokenStr);
                HttpEntity<String> entity = new HttpEntity<>("", headers);
                ResponseEntity<Map> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo", 
                        HttpMethod.GET, entity, Map.class);
                Map<String, Object> payload = response.getBody();
                if (payload == null || !payload.containsKey("email")) {
                    throw new RuntimeException("Mã truy cập Google không hợp lệ!");
                }
                email = (String) payload.get("email");
                name = (String) payload.get("name");
                picture = (String) payload.get("picture");
            }

            // Kiểm tra xem user đã tồn tại chưa
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Đăng ký mới
                user = User.builder()
                        .username(email) // dùng tạm email làm username hoặc sinh tự động UUID
                        .email(email)
                        .fullName(name)
                        .avatarUrl(picture)
                        // mật khẩu tạo ngẫu nhiên do đăng nhập bằng Google không cần pass
                        .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                        .role("USER")
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                userRepository.save(user);
            } else {
                boolean isUpdated = false;
                if (user.getFullName() == null || user.getFullName().isEmpty()) {
                    user.setFullName(name);
                    isUpdated = true;
                }
                if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                    user.setAvatarUrl(picture);
                    isUpdated = true;
                }
                if (isUpdated) {
                    userRepository.save(user);
                }
            }

            // Tạo token JWT của hệ thống
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPasswordHash())
                    .roles(user.getRole())
                    .build();
            String jwtToken = jwtService.generateToken(userDetails);

            return AuthResponse.builder()
                    .token(jwtToken)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .fullName(user.getFullName())
                    .avatarUrl(user.getAvatarUrl())
                    .build();

        } catch (Exception e) {
            log.error("Lỗi xác thực Google: ", e);
            throw new RuntimeException("Lỗi đăng nhập Google: " + e.getMessage());
        }
    }
}
