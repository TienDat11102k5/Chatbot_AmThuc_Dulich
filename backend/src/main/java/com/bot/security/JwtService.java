package com.bot.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service chuyên biệt để tạo mới (Generate), giải mã (Extract) và 
 * kiểm tra tính hợp lệ (Validation) của Token JWT bằng thư viện io.jsonwebtoken.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Trích xuất thông tin định danh Username (Subject) được ký nạp bên trong JWT Payload.
     *
     * @param token Chuỗi mã JWT truyền chuyển từ lớp trên xuống.
     * @return Tên đăng nhập nguyên bản dưới dạng String.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Tạo ra (Generate) một chuỗi JWT cơ bản nhúng các giá trị claim chuẩn thông qua Profile của người dùng.
     *
     * @param userDetails Khung dữ liệu User tích hợp Spring Security đã qua quá trình xác thực.
     * @return Chuỗi token JWT hợp chuẩn Base64.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Tiến trình xác nhận một token còn dùng được hay không. 
     * Cụ thể so sánh tên đăng nhập giải mã từ Token với UserDetails truyền từ request và đối soát mốc thời gian (Expiration).
     *
     * @param token Đoạn chuỗi Token trích xuất từ Header.
     * @param userDetails Spring Security User tương ứng với JWT Subject khai báo.
     * @return true giả định Token hợp lệ, không bị can thiệp và chưa ngưng hoạt động.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
