import { executeRemote } from './run-remote.mjs';

const nginxConf = `server {
    server_name roubao.cloud www.roubao.cloud;

    # HTTP/2 Support & SSL
    listen [::]:443 ssl http2 ipv6only=on;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/roubao.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/roubao.cloud/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1024;

    # Keepalive
    keepalive_timeout 75s;
    keepalive_requests 1000;

    # Proxy Buffer & Timeout
    proxy_connect_timeout 30s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20m;
    }

    location /_next/static/ {
        alias /opt/roubao/frontend/.next/static/;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name roubao.cloud www.roubao.cloud _;
    return 301 https://$host$request_uri;
}
`;

const cmd = `cat << 'EOF' > /etc/nginx/sites-available/roubao.conf
${nginxConf}
EOF
nginx -t && nginx -s reload
echo NGINX_TUNED_SUCCESSFULLY
`;

console.log('Applying tuned Nginx configuration with HTTP/2 and Gzip...');
const res = await executeRemote(cmd, 30);
console.log(res.output);
