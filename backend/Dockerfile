# ==============================================================================
# Roubao (肉包) 后端多阶段构建 Dockerfile
# 运行环境: Eclipse Temurin 21 JRE Alpine (极简、轻量、高安全)
# 架构特性: Java 21 LTS 虚拟线程原生就绪 + 容器自适应内存分配
# ==============================================================================

# --- Stage 1: 构建阶段 ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# 安装基础依赖
RUN apk add --no-cache maven

# 依赖描述文件复制
COPY pom.xml .
COPY roubao-framework/pom.xml roubao-framework/
COPY roubao-article/pom.xml roubao-article/
COPY roubao-project/pom.xml roubao-project/
COPY roubao-admin/pom.xml roubao-admin/
COPY roubao-app/pom.xml roubao-app/

# 拷贝全量子模块源码
COPY roubao-framework/src roubao-framework/src
COPY roubao-article/src roubao-article/src
COPY roubao-project/src roubao-project/src
COPY roubao-admin/src roubao-admin/src
COPY roubao-app/src roubao-app/src

# 编译并生成生产可执行胖 JAR (跳过单测加速构建，测试已由 CI 严格核销)
RUN mvn clean package -DskipTests -B

# --- Stage 2: 生产运行阶段 ---
FROM eclipse-temurin:21-jre-alpine AS runner

# 创建非 root 专属系统账号 (UID 10001)，践行最小权限基线
RUN addgroup -g 10001 -S roubao && adduser -u 10001 -S roubao -G roubao \
    && apk add --no-cache curl wget tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app

# 拷贝产物并设置安全权限
COPY --from=builder --chown=roubao:roubao /build/roubao-app/target/roubao-app-*.jar app.jar

USER roubao:roubao

# JVM 容器自适应参数调优与 Java 21 虚拟线程支持
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseZGC -XX:+ZGenerational -Djava.security.egd=file:/dev/./urandom -Dfile.encoding=UTF-8"
ENV SPRING_PROFILES_ACTIVE="prod"

EXPOSE 8080

# 生产 Actuator 健康探针
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
