#!/usr/bin/env bash
# ==============================================================================
# Roubao (肉包) 阿里云 Ubuntu 24.04 一键全自动容器化生产部署引擎
# 适用规格: 2 vCPU 1 GiB 内存 (自动加装 4GB Swap + 低内存防 OOM 调优)
# 绑定域名: roubao.cloud
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}        🚀 Roubao (肉包) 生产环境全自动容器化部署 (roubao.cloud)             ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 0. 检查 root 权限
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ 请使用 root 权限或 sudo 运行此脚本！${NC}"
  exit 1
fi

# 1. 内存防崩护栏：检查并配置 4GB Swap 虚拟内存
echo -e "\n${YELLOW}>>> [Step 1/6] 检查系统虚拟内存与 Swap 空间 (防 1GB 内存 OOM)...${NC}"
CURRENT_SWAP=$(free -m | awk '/Swap/ {print $2}')
if [ "$CURRENT_SWAP" -lt 2048 ]; then
  echo -e "${YELLOW}当前 Swap 为 ${CURRENT_SWAP}MB，小于 2GB。正在创建 4GB 高速虚拟内存文件 /swapfile...${NC}"
  swapoff -a || true
  rm -f /swapfile
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  sysctl vm.swappiness=20 > /dev/null
  if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=20' >> /etc/sysctl.conf
  fi
  echo -e "${GREEN}✅ 4GB Swap 虚拟内存挂载成功！当前内存概况：${NC}"
  free -h
else
  echo -e "${GREEN}✅ Swap 空间充足 (${CURRENT_SWAP}MB)，跳过配置。${NC}"
fi

# 2. 安装 Docker 与 Docker Compose 插件 (针对 Ubuntu 24.04 Noble)
echo -e "\n${YELLOW}>>> [Step 2/6] 检查并安装 Docker 与 Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
  echo "Docker 未安装，正在通过官方 APT 源安装最新版 Docker Engine..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo -e "${GREEN}✅ Docker 与 Docker Compose 安装完毕！${NC}"
else
  echo -e "${GREEN}✅ Docker 已安装: $(docker --version)${NC}"
fi

# 3. 拉取/同步代码至 /opt/roubao
echo -e "\n${YELLOW}>>> [Step 3/6] 同步代码仓库至 /opt/roubao...${NC}"
APP_DIR="/opt/roubao"
if [ ! -d "$APP_DIR/.git" ]; then
  echo "正在克隆代码仓库 https://github.com/happypig1224/roubao.git ..."
  rm -rf "$APP_DIR"
  git clone https://github.com/happypig1224/roubao.git "$APP_DIR"
else
  echo "仓库已存在，执行 git fetch & reset to origin/main ..."
  cd "$APP_DIR"
  git fetch origin main
  git reset --hard origin/main
fi

cd "$APP_DIR/deploy"

# 4. 生产环境配置就绪
echo -e "\n${YELLOW}>>> [Step 4/6] 检查生产环境配置文件 (.env)...${NC}"
if [ ! -f .env ]; then
  echo "正在从 .env.example 生成生产配置模板..."
  cp .env.example .env
  # 生成高熵 32 位随机 Admin Token (符合 >= 16 位且非默认弱口令的安全红线)
  GENERATED_TOKEN=$(tr -dc A-Za-z0-9_#%*+=- </dev/urandom | head -c 32 || echo "RoubaoSecureProdToken2026_$(date +%s)")
  sed -i "s/ADMIN_TOKEN=.*/ADMIN_TOKEN=${GENERATED_TOKEN}/" .env
  echo -e "${GREEN}已自动为生产环境注入安全 Admin Token: ${GENERATED_TOKEN}${NC}"
else
  echo -e "${GREEN}检测到现有 .env 配置，保留现有凭据。${NC}"
fi

# 5. 阶梯串行构建镜像 (严格避免 1GB 内存并行构建抖动)
echo -e "\n${YELLOW}>>> [Step 5/6] 串行构建生产 Docker 镜像 (低内存防爆防锁)...${NC}"
echo "1/2 编译并构建 Spring Boot 3 / Java 21 后端镜像..."
docker compose build backend

echo "2/2 编译并构建 Next.js 16 前端 Standalone 镜像..."
docker compose build frontend

# 6. 编排并拉起服务集群
echo -e "\n${YELLOW}>>> [Step 6/6] 启动全栈生产容器编排集群...${NC}"
docker compose up -d

echo -e "\n${YELLOW}正在等待容器健康检查就绪 (约 20 秒)...${NC}"
sleep 20

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}🎉 恭喜！Roubao (肉包) 生产集群已成功部署上线！${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo -e "🌐 前端访问地址: ${GREEN}http://roubao.cloud${NC} 或 ${GREEN}http://47.251.182.2${NC}"
echo -e "🛠️ 独立管理后台: ${GREEN}http://roubao.cloud/admin${NC}"
echo -e "🩺 后端健康探针: ${GREEN}http://47.251.182.2/actuator/health${NC}"
echo -e "📋 查看容器状态: ${YELLOW}docker compose ps${NC}"
echo -e "📜 查看实时日志: ${YELLOW}docker compose logs -f${NC}"
echo -e "${BLUE}------------------------------------------------------------------------------${NC}"
echo -e "${YELLOW}⚠️ 【重要提醒】请确保在阿里云轻量服务器控制台的【防火墙】中放行了 80 和 443 端口！${NC}"
echo -e "${BLUE}==============================================================================${NC}"

