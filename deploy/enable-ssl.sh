#!/usr/bin/env bash
# ==============================================================================
# Roubao (肉包) 一键申请并装配 Let's Encrypt 免费 HTTPS 证书 (roubao.cloud)
# ==============================================================================

set -e

DOMAIN="roubao.cloud"
EMAIL="3304661481@qq.com"

echo ">>> 正在为 ${DOMAIN} 及 www.${DOMAIN} 自动化配置 Let's Encrypt SSL 证书..."

if ! command -v certbot &> /dev/null; then
  apt-get update -y && apt-get install -y certbot python3-certbot-nginx
fi

# 自动化申请并直接配置进 Nginx 站点，开启 HTTP -> HTTPS 自动 301 重定向
certbot --nginx \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  -m "${EMAIL}" \
  --redirect

# 启用自动定时续期守护
systemctl enable --now certbot.timer

echo "✅ HTTPS 证书申请并装配完成！全站已启用 SSL 加密与自动续期。"
