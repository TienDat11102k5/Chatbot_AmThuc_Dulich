# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
# Cấp quyền thực thi cho maven wrapper
RUN chmod +x ./mvnw
# Tải trước dependencies (cache)
RUN ./mvnw dependency:go-offline -B
COPY src ./src
# Build ứng dụng (bỏ qua Test để nhanh hơn)
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy file JAR đã build từ stage trước
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# Chạy Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
