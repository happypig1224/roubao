#!/usr/bin/env bash
# ==============================================================================
# Roubao (肉包) 生产 MySQL 自动化热备与滚动归档脚本
# 执行机制: mysqldump 热备 + Gzip 高压缩 + MD5 完整性校验 + 7天滚动轮换
# 适用环境: 宿主机 Crontab 定时调度 / Docker Compose 容器化环境
# ==============================================================================

set -eo pipefail

# 基础目录与变量配置
BACKUP_DIR="${BACKUP_DIR:-/opt/roubao/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/roubao_blog_${TIMESTAMP}.sql.gz"
MD5_FILE="${BACKUP_FILE}.md5"

# 数据库连接参数 (优先读取环境变量)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-roubao_blog}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
CONTAINER_NAME="${DOCKER_MYSQL_CONTAINER:-roubao-mysql}"

mkdir -p "${BACKUP_DIR}"

log() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*"
}

log ">>> 开始执行 Roubao 数据库热备份: target=${DB_NAME} ..."

# 1. 检测备份执行通道 (Docker 容器优先，本地 mysqldump 次之)
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  log "检测到运行中的 MySQL 容器 [${CONTAINER_NAME}]，执行容器化热备份..."
  docker exec -i "${CONTAINER_NAME}" mysqldump \
    -u"${DB_USER}" \
    -p"${DB_PASSWORD}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --default-character-set=utf8mb4 \
    "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"
elif command -v mysqldump &>/dev/null; then
  log "检测到本地 mysqldump 命令，执行直接连接热备份..."
  MYSQL_PWD="${DB_PASSWORD}" mysqldump \
    -h"${DB_HOST}" \
    -P"${DB_PORT}" \
    -u"${DB_USER}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --default-character-set=utf8mb4 \
    "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"
else
  log "❌ 错误: 未找到 docker 或 mysqldump 工具，备份终止！"
  exit 1
fi

# 2. 备份有效性与文件体积校验
if [ ! -s "${BACKUP_FILE}" ]; then
  log "❌ 错误: 备份产物为空文件: ${BACKUP_FILE}"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

FILE_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
log "✅ 备份文件压缩生成成功: ${BACKUP_FILE} (体积: ${FILE_SIZE})"

# 3. 生成 MD5 完整性校验文件
if command -v md5sum &>/dev/null; then
  md5sum "${BACKUP_FILE}" > "${MD5_FILE}"
  log "✅ 校验码已落盘: ${MD5_FILE}"
elif command -v md5 &>/dev/null; then
  md5 -r "${BACKUP_FILE}" > "${MD5_FILE}"
  log "✅ 校验码已落盘: ${MD5_FILE}"
fi

# 4. 滚动轮换：清理超过保留期的旧备份
log ">>> 执行历史旧备份轮换清理 (保留最近 ${RETENTION_DAYS} 天)..."
CLEANED_COUNT="$(find "${BACKUP_DIR}" -name "roubao_blog_*.sql.gz*" -type f -mtime +"${RETENTION_DAYS}" | wc -l || echo 0)"
find "${BACKUP_DIR}" -name "roubao_blog_*.sql.gz*" -type f -mtime +"${RETENTION_DAYS}" -delete
log "✅ 历史旧备份轮换清理完毕，共移除 ${CLEANED_COUNT} 个过期备份文件。"

log "🎉 Roubao 数据库热备份全流程执行完毕！"
