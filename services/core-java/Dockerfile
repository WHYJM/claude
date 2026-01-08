# ============================================
# Smart Kitchen Core Service (Java)
# ============================================

# Stage 1: 构建
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# 先复制 pom.xml 利用 Docker 缓存
COPY pom.xml .
RUN mvn dependency:go-offline

# 复制源码并构建
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: 运行
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 添加非 root 用户
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
