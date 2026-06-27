# Xiangqi Master - Deployment Guide

## Target: Hostinger VPS (Ubuntu 24.04)

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Reboot or re-login for group changes
```

### Clone & Configure

```bash
git clone <repo-url> /opt/xiangqi-master
cd /opt/xiangqi-master

# Create environment file
cp .env.example .env
nano .env  # Edit passwords and configuration
```

### Required .env variables

```bash
# Database
DB_PASSWORD=<strong-password>

# Redis (optional, leave empty for no password in dev)
REDIS_PASSWORD=<redis-password>

# Engine (Pikafish binary path in container)
ENGINE_PATH=/usr/local/bin/pikafish

# Domain (for CORS)
DOMAIN=your-domain.com
```

### Start Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
echo "0 3 * * * certbot renew --quiet" | sudo crontab -
```

### Database Backup

```bash
# Manual backup
docker compose exec postgres pg_dump -U xiangqi xiangqi > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * cd /opt/xiangqi-master && docker compose exec -T postgres pg_dump -U xiangqi xiangqi > backups/backup_$(date +\%Y\%m\%d).sql
```

### Monitoring

```bash
# API health
curl http://localhost:3000/api/engine/status

# Container status
docker compose ps

# Resource usage
docker stats
```

### Troubleshooting

**Engine not available**: Pikafish binary must be compiled and placed at ENGINE_PATH.
For production, build Pikafish from source or download from pikafish.com.

**Database connection refused**: Check DATABASE_PASSWORD matches docker-compose POSTGRES_PASSWORD.

**Port conflict**: Change nginx port mapping in docker-compose.yml.
