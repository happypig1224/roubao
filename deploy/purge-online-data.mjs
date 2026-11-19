import { executeRemote } from './run-remote.mjs';

const purgeCmd = `
echo "=== 1. Purging MySQL Database roubao_blog ==="
mysql -u roubao_user -pRoubaoProd2026UserSecurePass! roubao_blog -e "
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tb_article;
TRUNCATE TABLE tb_article_content;
TRUNCATE TABLE tb_article_stats;
TRUNCATE TABLE tb_category;
TRUNCATE TABLE tb_project;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'tb_article:', COUNT(*) FROM tb_article;
SELECT 'tb_project:', COUNT(*) FROM tb_project;
" 2>&1

echo "=== 2. Flushing Redis ==="
redis-cli FLUSHALL

echo "=== 3. Purging Frontend Data and Cache ==="
mkdir -p /opt/roubao/frontend/data
echo "[]" > /opt/roubao/frontend/data/articles.json
rm -rf /opt/roubao/frontend/.next/cache || true

echo "=== 4. Verifying DB & Redis Status ==="
redis-cli KEYS "*"
cat /opt/roubao/frontend/data/articles.json

echo "DATA_PURGED_SUCCESSFULLY"
`;

console.log('Purging all online data...');
const res = await executeRemote(purgeCmd, 30);
console.log(res.output);
