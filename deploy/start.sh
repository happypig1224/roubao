#!/usr/bin/env bash
set -e

# ==============================================================================
# Roubao (肉包) 一键容器化部署脚本 (Linux / macOS)
# ==============================================================================

cd "$(dirname "$0")"

echo "=========================================="
echo "🚀 启动 Roubao 生产级容器集群..."
echo "=========================================="

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️ 未发现 .env 文件，正从 .env.example 自动生成初始配置文件..."
    cp .env.example .env
  else
    echo "❌ 错误: 未找到 .env 或 .env.example 文件！"
    exit 1
  fi
fi

# 构建并启动所有服务
docker compose up -d --build

echo ""
echo "✅ 容器编排集群启动成功！"
echo "🌐 访问入口: http://localhost"
echo "📊 后端健康探针: http://localhost/actuator/health"
echo "📜 查看容器实时日志: docker compose logs -f"
