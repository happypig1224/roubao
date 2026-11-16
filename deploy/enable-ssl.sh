#!/usr/bin/env bash
# ==============================================================================
# Roubao (肉包) 一键申请并装配 Let's Encrypt 免费 HTTPS 证书 (roubao.cloud)
# ==============================================================================

set -e

DOMAIN="roubao.cloud"
EMAIL="admin@${DOMAIN}"

echo ">>> 正在为 ${DOMAIN} 申请并配置 Let's Encrypt SSL 证书..."

if ! command -v certbot &> /dev/null; then
  apt-get update -y && apt-get install -y certbot
fi

# 停止容器 Nginx 临时释放 80 端口用于 HTTP-01 验证
docker compose stop nginx

# 申请证书
certbot certonly --standalone -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos --email "${EMAIL}" || {
  echo "❌ 证书申请失败，请确认域名 DNS A 记录已解析至本机公网 IP！"
  docker compose start nginx
  exit 1
}

# 恢复 Nginx 容器
docker compose start nginx

echo "✅ 证书申请成功！证书位于 /etc/letsencrypt/live/${DOMAIN}/"
