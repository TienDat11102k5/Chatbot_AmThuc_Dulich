package com.bot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bộ lọc (Filter) bắt mọi Request HTTP gửi đến Backend để kiểm tra xem 
 * yêu cầu đó có chứa Token JWT hợp lệ trên Header hay không.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Logic lõi của Filter: Phân tích Header 'Authorization', trích xuất mã Token JWT, 
     * giải mã lấy Username và tiến hành xác thực lệ cùng UserDetailsService.
     * Bỏ qua các đường dẫn truy cập tự do liên quan đến xác thực (auth).
     *
     * @param request Lớp HttpRequest đại diện cho gói tin HTTP truyền đến.
     * @param response Lớp HttpResponse đóng gói luồng ra.
     * @param filterChain Dây chuyền Filter chuyển tiếp request qua các chốt kiểm duyệt kế tiếp.
     * @throws ServletException Bắn ra khi có lỗi phần xử lý tầng Servlet logic.
     * @throws IOException Bắn ra khi có lỗi I/O đọc vi phân hoặc gửi đáp trả mạng.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // Bỏ qua việc kiểm tra JWT đối với các api đăng ký, đăng nhập
        if (request.getServletPath().startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
