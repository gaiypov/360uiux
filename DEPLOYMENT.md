# 360° РАБОТА - Deployment Guide

Complete guide for deploying the 360° РАБОТА platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Services

1. **Server** (Ubuntu 22.04 LTS or similar)
   - 4 CPU cores minimum
   - 8GB RAM minimum
   - 100GB SSD storage

2. **PostgreSQL** (15+)
   - For storing application data

3. **Redis** (7+)
   - For caching and session management

4. **Yandex Cloud Storage**
   - For video file storage and transcoding

5. **OneSignal Account**
   - For push notifications

6. **Domain Names**
   - API: `api.360rabota.ru`
   - Frontend: `app.360rabota.ru`

### Required Software

```bash
# Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# Node.js 18+ (for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# FFmpeg (for video processing)
sudo apt-get install -y ffmpeg
```

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
│ (React Native) │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Nginx (Reverse  │
│     Proxy)       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌─────────────┐
│  Backend API     │◄────►│  PostgreSQL │
│  (Node.js +      │      └─────────────┘
│   Express)       │
└──────┬───────────┘
       │              ┌─────────────┐
       └─────────────►│    Redis    │
                      └─────────────┘

External Services:
- Yandex Cloud (Video Storage)
- OneSignal (Push Notifications)
- Tinkoff/Alfabank (Payments)
```

## 💻 Local Development

### 1. Clone Repository

```bash
git clone https://github.com/gaiypov/360uiux.git
cd 360uiux
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Setup Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your local settings

# Root
cp .env.example .env
# Edit .env for docker-compose
```

### 4. Start Services with Docker

```bash
# Start PostgreSQL + Redis
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps

# Run migrations
cd backend
npm run migrate
```

### 5. Start Development Server

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd ..
npm start
```

## 🚀 Production Deployment

### Option 1: Docker Compose (Recommended)

#### 1. Setup Server

```bash
# SSH to your production server
ssh root@your-server-ip

# Create application directory
mkdir -p /opt/360rabota
cd /opt/360rabota
```

#### 2. Clone Repository

```bash
git clone https://github.com/gaiypov/360uiux.git .
```

#### 3. Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

**Important Environment Variables:**

```bash
# Strong JWT secret (minimum 32 characters)
JWT_SECRET=$(openssl rand -base64 32)

# Strong database password
DB_PASSWORD=$(openssl rand -base64 24)

# Strong Redis password
REDIS_PASSWORD=$(openssl rand -base64 24)
```

#### 4. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.yml build

# Start all services
docker-compose -f docker-compose.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

#### 5. Run Database Migrations

```bash
docker-compose exec backend npm run migrate
```

#### 6. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/360rabota
```

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/360rabota

upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name api.360rabota.ru;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.360rabota.ru;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.360rabota.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.360rabota.ru/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Max body size (for video uploads)
    client_max_body_size 100M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/360rabota /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.360rabota.ru

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### Option 2: Manual Deployment

#### 1. Build Backend

```bash
cd backend
npm ci --only=production
npm run build
```

#### 2. Setup PM2 Process Manager

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start dist/server.js --name 360rabota-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 3. Configure PM2 Ecosystem

```bash
# Create ecosystem.config.js
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: '360rabota-backend',
    script: './dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: '/var/log/360rabota/error.log',
    out_file: '/var/log/360rabota/out.log',
    max_memory_restart: '1G',
  }],
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
```

## 🗄️ Database Setup

### Initial Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE 360rabota_prod;
CREATE USER 360rabota WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE 360rabota_prod TO 360rabota;
\q
```

### Run Migrations

```bash
# Using Docker
docker-compose exec backend npm run migrate

# Using PM2
cd backend
npm run migrate
```

### Backup Strategy

```bash
# Daily backup script
nano /opt/360rabota/scripts/backup-db.sh
```

```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="360rabota_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Create backup
docker-compose exec -T postgres pg_dump -U postgres 360rabota_prod | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

```bash
# Make executable
chmod +x /opt/360rabota/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /opt/360rabota/scripts/backup-db.sh
```

## ⚙️ Environment Configuration

### Required Environment Variables

See `.env.production.example` for complete list.

### Obtaining API Keys

#### OneSignal (Push Notifications)

1. Go to [https://onesignal.com/](https://onesignal.com/)
2. Create a new app
3. Configure iOS (APNS) and Android (FCM) push certificates
4. Get App ID and REST API Key from Settings

#### Yandex Cloud (Video Storage)

1. Go to [https://console.cloud.yandex.ru/](https://console.cloud.yandex.ru/)
2. Create Object Storage bucket
3. Create service account with storage.editor role
4. Generate static access keys
5. Get IAM token for Video API

#### Payment Providers

- **Tinkoff**: Contact Tinkoff Business for API credentials
- **Alfabank**: Register at Alfabank Merchant Portal

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes automatic CI/CD via GitHub Actions (`.github/workflows/ci-cd.yml`):

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Pipeline Steps:**

1. **Test** - Run unit and integration tests
2. **Build** - Build Docker image
3. **Security Scan** - Scan with Trivy
4. **Deploy** - Deploy to production (main branch only)

### Manual Deployment

```bash
# Pull latest changes
cd /opt/360rabota
git pull origin main

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend

# Check logs
docker-compose logs -f backend
```

## 📊 Monitoring & Logging

### Health Checks

```bash
# Backend health check
curl https://api.360rabota.ru/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "uptime": 12345,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Logging

```bash
# View backend logs
docker-compose logs -f backend

# View all logs
docker-compose logs -f

# Follow logs from specific time
docker-compose logs --since 30m backend
```

### Metrics

Recommended monitoring tools:

- **Prometheus + Grafana** - Metrics collection and visualization
- **Sentry** - Error tracking
- **Datadog** - APM and infrastructure monitoring

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# View logs
docker-compose logs postgres
```

#### 2. Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# View logs
docker-compose logs redis
```

#### 3. Video Processing Errors

```bash
# Check FFmpeg is installed
docker-compose exec backend ffmpeg -version

# Check temp directory permissions
docker-compose exec backend ls -la /tmp/360rabota-video-processing
```

#### 4. High Memory Usage

```bash
# Check container memory
docker stats

# Restart services
docker-compose restart backend
```

### Performance Optimization

```bash
# Enable Redis persistence
# Add to docker-compose.yml:
redis:
  command: redis-server --appendonly yes

# Increase PostgreSQL connections
# In postgresql.conf:
max_connections = 200
shared_buffers = 2GB
```

## 📞 Support

- **Documentation**: https://github.com/gaiypov/360uiux/wiki
- **Issues**: https://github.com/gaiypov/360uiux/issues
- **Email**: support@360rabota.ru

## 📝 License

Proprietary - All rights reserved.
