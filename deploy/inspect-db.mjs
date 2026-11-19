import { executeRemote } from './run-remote.mjs';

const cmd = `
mysql -u roubao_user -pRoubaoProd2026UserSecurePass! roubao_blog -e "
SELECT 'tb_article:', COUNT(*) FROM tb_article;
SELECT 'tb_article_content:', COUNT(*) FROM tb_article_content;
SELECT 'tb_article_stats:', COUNT(*) FROM tb_article_stats;
SELECT 'tb_category:', COUNT(*) FROM tb_category;
SELECT 'tb_project:', COUNT(*) FROM tb_project;
" 2>&1

echo "=== Redis Keys ==="
redis-cli KEYS "*"

echo "=== Local Storage / Uploads ==="
find /opt/roubao -type f -name "*.png" -o -name "*.jpg" -o -name "*.webp" -o -name "*.md" | grep -v "node_modules" | grep -v ".git" || true

echo "=== Frontend Data ==="
cat /opt/roubao/frontend/data/articles.json
`;

const r = await executeRemote(cmd, 30);
console.log(r.output);
