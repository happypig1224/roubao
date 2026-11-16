# ==============================================================================
# Roubao (肉包) 一键容器化部署脚本 (Windows PowerShell)
# ==============================================================================

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 启动 Roubao 生产级容器集群..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "⚠️ 未发现 .env 文件，正从 .env.example 自动生成初始配置文件..." -ForegroundColor Yellow
        Copy-Item -Path ".env.example" -Destination ".env"
    } else {
        Write-Error "❌ 错误: 未找到 .env 或 .env.example 文件！"
    }
}

# 构建并启动所有服务
docker compose up -d --build

Write-Host ""
Write-Host "✅ 容器编排集群启动成功！" -ForegroundColor Green
Write-Host "🌐 访问入口: http://localhost" -ForegroundColor Green
Write-Host "📊 后端健康探针: http://localhost/actuator/health" -ForegroundColor Green
Write-Host "📜 查看容器实时日志: docker compose logs -f" -ForegroundColor DarkGray
