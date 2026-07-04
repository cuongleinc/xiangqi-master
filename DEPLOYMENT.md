# Xiangqi Master — Deployment Guide

## Target: Hostinger VPS (Ubuntu 24.04)

This guide covers deploying Xiangqi Master on a Hostinger KVM VPS from scratch.

---

## 1. VPS Setup

### 1.1 Access Your VPS

After purchasing a Hostinger VPS plan, you'll receive:
- **IP address** — shown in hPanel → VPS → Overview
- **Root password** — set during VPS creation or via hPanel → VPS → Settings → Reset Password

```bash
ssh root@<your-vps-ip>
```

### 1.2 Initial Server Hardening

```bash
# Update everything
apt update && apt upgrade -y

# Set hostname
hostnamectl set-hostname xiangqi

# Create a non-root user (optional but recommended)
adduser deploy
usermod -aG sudo deploy

# Set up firewall — allow only SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Create swap file (Hostinger VPS often ships without one)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 2. Install Docker

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add your user to the docker group
usermod -aG docker $USER

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
ssh root@<your-vps-ip>
```

---

## 3. Build & Deploy the App

### 3.1 Clone the Repository

```bash
mkdir -p /opt/xiangqi-master
cd /opt/xiangqi-master

git clone https://github.com/cuongleinc/xiangqi-master.git .
```

### 3.2 Configure Environment

```bash
cp .env.example .env
nano .env
```

Required variables in `.env`:

```bash
DB_PASSWORD=<generate-a-strong-random-password>
REDIS_PASSWORD=<generate-another-strong-password>
ENGINE_PATH=/usr/local/bin/pikafish
CORS_ORIGIN=https://<your-domain.com>
```

### 3.3 Install Pikafish Engine

The API container expects Pikafish at `/usr/local/bin/pikafish`. Build it directly on the VPS:

```bash
# Install build dependencies
apt install -y git make g++

# Clone and build
git clone https://github.com/official-pikafish/Pikafish.git /tmp/pikafish
cd /tmp/pikafish/src

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
  x86_64)   BUILD_ARCH=x86-64-modern ;;
  aarch64)  BUILD_ARCH=armv8 ;;
  *)        BUILD_ARCH=x86-64 ;;
esac

make -j$(nproc) build ARCH=$BUILD_ARCH

# Install binary and NNUE weights
cp pikafish /usr/local/bin/
cp pikafish.nnue /usr/local/bin/
```

### 3.4 Update Nginx Config

Edit `infrastructure/nginx/xiangqi.conf` — replace `localhost` with your actual domain:

```nginx
server {
    listen 80;
    server_name <your-domain.com>;

    location / {
        proxy_pass http://web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3.5 Start All Services

```bash
cd /opt/xiangqi-master
docker compose up -d
```

Check that everything is running:

```bash
docker compose ps
# All 5 services should show "Up": postgres, redis, api, web, nginx

# Check API health
curl http://localhost:3000/api/engine/status
```

---

## 4. Domain & SSL (Hostinger)

### 4.1 Point Your Domain

1. In **hPanel → Domains → your-domain.com → DNS / Nameservers**
2. Add an **A record** pointing `@` to your VPS IP address
3. Add a **CNAME** record for `www` → `@` (if desired)
4. Wait for DNS propagation (5–30 minutes)

### 4.2 Install SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot -y

# Stop nginx — Certbot needs port 80 for standalone verification
docker compose stop nginx

# Obtain certificate
certbot certonly --standalone -d <your-domain.com> -d www.<your-domain.com>

# Start nginx again
docker compose start nginx
```

### 4.3 Configure Nginx for HTTPS

Update `infrastructure/nginx/xiangqi.conf` to include SSL:

```nginx
server {
    listen 80;
    server_name <your-domain.com>;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name <your-domain.com>;

    ssl_certificate /etc/letsencrypt/live/<your-domain.com>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your-domain.com>/privkey.pem;

    location / {
        proxy_pass http://web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then mount the certs into the nginx container by adding to `docker-compose.yml` under the `nginx` service volumes:

```yaml
volumes:
  - ./infrastructure/nginx/xiangqi.conf:/etc/nginx/conf.d/default.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

Restart nginx:

```bash
docker compose restart nginx
```

### 4.4 Auto-Renewal

```bash
echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/xiangqi-master/docker-compose.yml restart nginx" | crontab -
```

---

## 5. Database Backup

```bash
# Create a backup directory
mkdir -p /opt/backups

# Manual backup
docker compose exec postgres pg_dump -U xiangqi xiangqi > /opt/backups/backup_$(date +%Y%m%d).sql

# Daily cron backup
echo "0 2 * * * cd /opt/xiangqi-master && docker compose exec -T postgres pg_dump -U xiangqi xiangqi > /opt/backups/backup_\$(date +\%Y\%m\%d).sql" | crontab -
```

---

## 6. Monitoring & Maintenance

```bash
# API health check
curl http://localhost:3000/api/engine/status

# Container status
docker compose ps

# Resource usage
docker stats

# View logs
docker compose logs -f api
docker compose logs -f nginx

# Update the app
cd /opt/xiangqi-master
git pull
docker compose build --no-cache api web
docker compose up -d
```

---

## 7. Port Reference

| Port | Service | Public? |
|------|---------|---------|
| 80 | Nginx (HTTP) | Yes |
| 443 | Nginx (HTTPS) | Yes — with SSL configured |
| 3000 | API (internal) | No — Docker network only |
| 5432 | PostgreSQL (internal) | No |
| 6379 | Redis (internal) | No |

---

## 8. Troubleshooting

**Engine not available**: Pikafish must be compiled for the VPS architecture and placed at `/usr/local/bin/pikafish` with `pikafish.nnue` alongside it. Verify with `ls -la /usr/local/bin/pikafish*`.

**Database connection refused**: Ensure `DB_PASSWORD` in `.env` matches what PostgreSQL expects. On first run, recreate volumes if you changed the password: `docker compose down -v && docker compose up -d`.

**Port 80 already in use**: Hostinger VPS may have a pre-installed web server. Stop it: `systemctl stop apache2 nginx; systemctl disable apache2 nginx`.

**Out of memory**: Add swap (see section 1.2) or upgrade to a higher-tier VPS with more RAM. Pikafish needs ~64MB minimum.

**DNS not resolving**: Verify your A record is correct in hPanel. Use `nslookup <your-domain.com>` to check propagation.

**SSL renewal fails**: Certbot's standalone mode needs port 80 free. Ensure `docker compose stop nginx` runs before renewal, then `docker compose start nginx` after.
