package com.bot.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Rate Limiter Filter — Giới hạn số lượng request theo địa chỉ IP.
 *
 * <p><b>Mục đích:</b> Bảo vệ hệ thống khỏi bị tấn công spam request hoặc
 * DDoS nhỏ bằng cách giới hạn số request tối đa trong một khoảng thời gian.</p>
 *
 * <p><b>Thuật toán: Sliding Window Counter dùng Redis</b></p>
 * <p>Cách hoạt động từng bước:</p>
 * <ol>
 *   <li>Mỗi request đến → Lấy IP của client.</li>
 *   <li>Tạo Redis key: {@code rate:limit:{IP}} (VD: "rate:limit:192.168.1.1").</li>
 *   <li>Tăng bộ đếm lên 1 bằng lệnh Redis INCR (atomic, thread-safe).</li>
 *   <li>Nếu là lần đầu tiên (count = 1) → Đặt thời hạn tự xóa bằng EXPIRE.</li>
 *   <li>Nếu count vượt ngưỡng → Trả về HTTP 429 (Too Many Requests).</li>
 *   <li>Bộ đếm tự reset sau khi hết thời hạn (mà không cần xử lý thủ công).</li>
 * </ol>
 *
 * <p><b>Ví dụ thực tế:</b> Cấu hình 30 req / 60s:</p>
 * <ul>
 *   <li>Request 1-30 trong 60 giây: Đi qua bình thường.</li>
 *   <li>Request 31+: Trả HTTP 429 với message giải thích.</li>
 *   <li>Sau 60 giây: Bộ đếm tự xóa, user có thể gửi tiếp.</li>
 * </ul>
 *
 * <p><b>Graceful Degradation:</b> Nếu Redis bị sập, filter sẽ bỏ qua
 * giới hạn và cho toàn bộ request đi qua (thà không giới hạn hơn là
 * chặn nhầm user hợp lệ).</p>
 *
 * <p><b>Phạm vi áp dụng:</b> Chỉ giới hạn các endpoint chat (/api/v1/chat/*)
 * — nơi dễ bị spam nhất. Các endpoint auth, places... bỏ qua.</p>
 *
 * @see RedisTemplate
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /**
     * RedisTemplate để thực hiện lệnh Redis thủ công (INCR, EXPIRE).
     * Được inject từ Bean đã khai báo trong RedisConfig.
     */
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Số request tối đa cho phép trong một cửa sổ thời gian.
     * Đọc từ application.properties: rate.limit.max-requests (mặc định 30).
     */
    @Value("${rate.limit.max-requests:30}")
    private int maxRequests;

    /**
     * Độ dài cửa sổ thời gian tính bằng giây.
     * Đọc từ application.properties: rate.limit.window-seconds (mặc định 60).
     */
    @Value("${rate.limit.window-seconds:60}")
    private int windowSeconds;

    /**
     * Tiền tố Redis Key để tránh xung đột với các key khác.
     * VD: "rate:limit:192.168.1.1"
     */
    private static final String KEY_PREFIX = "rate:limit:";

    /**
     * Xử lý mỗi HTTP request đến — kiểm tra và áp dụng giới hạn request.
     *
     * <p>Method này chỉ giới hạn các request tới đường dẫn /api/v1/chat/*.
     * Các endpoint khác không bị ảnh hưởng.</p>
     *
     * @param request     HTTP request đến từ client.
     * @param response    HTTP response sẽ trả về cho client.
     * @param filterChain Chuỗi filter tiếp theo sẽ xử lý nếu request được phép.
     * @throws ServletException Nếu có lỗi trong quá trình xử lý servlet.
     * @throws IOException      Nếu có lỗi I/O khi ghi response.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Chỉ áp dụng rate limit cho các endpoint chat (dễ bị spam nhất)
        // Các endpoint auth, places, user... bỏ qua kiểm tra
        if (!requestPath.startsWith("/api/v1/chat")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Lấy địa chỉ IP thực của client (có xử lý reverse proxy)
        String clientIp = getClientIpAddress(request);
        String redisKey  = KEY_PREFIX + clientIp;

        try {
            // Bước 1: Tăng bộ đếm request cho IP này lên 1
            // INCR là lệnh atomic trong Redis → an toàn khi nhiều request đến cùng lúc
            Long requestCount = redisTemplate.opsForValue().increment(redisKey);

            // Bước 2: Nếu đây là request đầu tiên → Đặt thời hạn tự xóa
            // Phải đặt EXPIRE ngay lần đầu để bộ đếm tự reset sau windowSeconds giây
            if (requestCount != null && requestCount == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            // Bước 3: Kiểm tra xem có vượt ngưỡng không
            if (requestCount != null && requestCount > maxRequests) {
                log.warn("[RateLimit] IP {} đã vượt ngưỡng {} req/{}s — Trả HTTP 429",
                        clientIp, maxRequests, windowSeconds);

                // Trả về HTTP 429 với thông báo rõ ràng
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json; charset=UTF-8");
                response.getWriter().write(
                        "{\"errorCode\": \"RATE_LIMIT_EXCEEDED\", " +
                        "\"message\": \"Bạn đã gửi quá nhiều request. Vui lòng thử lại sau " + windowSeconds + " giây.\", " +
                        "\"retryAfter\": " + windowSeconds + "}"
                );
                return; // Dừng chain — không tiếp tục xử lý request
            }

        } catch (Exception e) {
            // Graceful Degradation: Redis bị sập → bỏ qua rate limit, cho request đi qua
            // Thà không giới hạn hơn là chặn nhầm user hợp lệ
            log.error("[RateLimit] Redis không khả dụng — bỏ qua rate limit: {}", e.getMessage());
        }

        // Request hợp lệ → chuyển tiếp cho Controller xử lý
        filterChain.doFilter(request, response);
    }

    /**
     * Lấy địa chỉ IP thực của client, có hỗ trợ các header reverse proxy phổ biến.
     *
     * <p>Thứ tự ưu tiên Header (từ cao xuống thấp):</p>
     * <ol>
     *   <li>{@code X-Forwarded-For}: Header chuẩn khi qua Load Balancer/Nginx.</li>
     *   <li>{@code X-Real-IP}: Header của Nginx.</li>
     *   <li>{@code RemoteAddr}: IP kết nối trực tiếp (fallback cuối).</li>
     * </ol>
     *
     * @param request HTTP request cần lấy IP.
     * @return Địa chỉ IP thực của client dưới dạng chuỗi.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Kiểm tra header X-Forwarded-For (khi qua Nginx / Load Balancer)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            // X-Forwarded-For có thể chứa nhiều IP: "client, proxy1, proxy2"
            // → Lấy IP đầu tiên (IP gốc của client)
            return xForwardedFor.split(",")[0].trim();
        }

        // Kiểm tra header X-Real-IP (header của Nginx)
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        // Fallback: Lấy IP kết nối trực tiếp từ TCP socket
        return request.getRemoteAddr();
    }
}
