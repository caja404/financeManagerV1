# Enterprise Backend - Professional Production Setup

## 🚀 Quick Start

### Development Setup

1. **Install Dependencies**
```powershell
cd backend-production
npm install
```

2. **Configure Environment**
```powershell
# Copy example env file
cp .env.example .env

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with your values
```

3. **Setup Database**
```powershell
# Using Docker (Recommended)
docker-compose up -d postgres

# Or install PostgreSQL locally
```

4. **Run Migrations**
```powershell
npm run prisma:generate
npm run prisma:migrate
```

5. **Start Development Server**
```powershell
npm run dev
```

Server runs on: http://localhost:4000

---

## 🏗️ Architecture Overview

### Production-Grade Features

✅ **Security**
- Helmet.js for secure HTTP headers
- Rate limiting (brute force protection)
- JWT authentication with secure tokens
- Password hashing with bcrypt (12 rounds)
- CORS configuration
- Input validation with Zod

✅ **Logging & Monitoring**
- Winston logger with daily rotation
- HTTP request logging (Morgan)
- Error tracking
- Health check endpoint

✅ **Error Handling**
- Global error handler
- Custom API errors
- Async error catching
- Validation errors

✅ **Database**
- Prisma ORM with TypeScript
- Connection pooling
- Migrations
- Indexes for performance

✅ **DevOps**
- Docker containerization
- Docker Compose for local dev
- Multi-stage builds
- Health checks
- Non-root user

✅ **Code Quality**
- TypeScript with strict mode
- ESLint + Prettier
- Path aliases
- Modular structure

---

## 📁 Project Structure

```
backend-production/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client & connection
│   │   ├── env.ts              # Environment validation
│   │   └── logger.ts           # Winston configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── error.middleware.ts # Error handling
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   └── validator.middleware.ts   # Zod validation
│   ├── routes/
│   │   ├── auth.routes.ts      # Auth endpoints
│   │   ├── transaction.routes.ts
│   │   └── budget.routes.ts
│   ├── utils/
│   │   ├── ApiError.ts         # Custom error class
│   │   └── ApiResponse.ts      # Standard responses
│   └── index.ts                # Main server file
├── .env.example                # Environment template
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── docker-compose.yml          # Local development
├── Dockerfile                  # Production build
├── package.json
└── tsconfig.json
```

---

## 🐳 Docker Deployment

### Local Development with Docker

```powershell
# Start all services (Postgres + API + Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

### Production Docker Build

```powershell
# Build image
docker build -t financemonitor-api .

# Run container
docker run -p 4000:4000 --env-file .env financemonitor-api
```

---

## 🌐 Deployment Options

### Option 1: DigitalOcean (Recommended - $10-20/month)

#### Prerequisites
- DigitalOcean account
- Domain name (optional)

#### Steps

**1. Create Droplet**
```bash
# Choose:
- Ubuntu 22.04
- Basic Plan ($12/month - 2GB RAM, 2 vCPU)
- Datacenter near your users
- Add SSH key
```

**2. Setup Server**
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app directory
mkdir -p /var/www/financemonitor-api
cd /var/www/financemonitor-api
```

**3. Deploy Application**
```bash
# Clone your repo
git clone YOUR_REPO_URL .

# Create .env file
nano .env
# Add your production environment variables

# Start services
docker-compose up -d

# Run migrations
docker-compose exec api npm run prisma:migrate

# Check logs
docker-compose logs -f
```

**4. Configure Firewall**
```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

**5. Setup Nginx Reverse Proxy**
```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/financemonitor

# Add config:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/financemonitor /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**6. Setup SSL with Let's Encrypt**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

**7. Setup Auto-Deploy with GitHub Actions**
- Add these secrets to your GitHub repo:
  - `DO_HOST`: Your droplet IP
  - `DO_USERNAME`: root
  - `DO_SSH_KEY`: Your private SSH key

---

### Option 2: AWS (Enterprise-Grade)

#### Using ECS Fargate

**1. Setup ECR (Container Registry)**
```bash
# Create repository
aws ecr create-repository --repository-name financemonitor-api

# Build and push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker build -t financemonitor-api .
docker tag financemonitor-api:latest YOUR_ECR_URL/financemonitor-api:latest
docker push YOUR_ECR_URL/financemonitor-api:latest
```

**2. Setup RDS (Database)**
```bash
# Create PostgreSQL instance
- Engine: PostgreSQL 16
- Instance: db.t3.micro (free tier) or db.t3.small
- Storage: 20GB
- Enable automatic backups
- Note the connection string
```

**3. Create ECS Cluster**
```bash
# Using AWS Console:
1. Go to ECS
2. Create Cluster (Fargate)
3. Create Task Definition
4. Create Service
5. Configure load balancer
6. Set environment variables
```

**4. Setup CloudWatch Logs**
- Automatic with ECS Fargate
- View logs in CloudWatch

---

### Option 3: Railway.app (Easiest - Free Tier)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend-production
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up

# Set environment variables
railway variables set JWT_SECRET=your-secret-here
railway variables set NODE_ENV=production

# Generate domain
railway domain
```

---

## 🔒 Security Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=4000

# Strong JWT secret (min 32 chars)
JWT_SECRET=<generated-with-crypto>
JWT_EXPIRES_IN=7d

# Database with connection pooling
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10

# CORS - Only your frontend domain
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # per window

# Logs
LOG_LEVEL=info
```

### SSL/HTTPS Setup

**Using Nginx + Let's Encrypt (Recommended)**
- Free SSL certificates
- Auto-renewal
- See DigitalOcean setup above

**Using CloudFlare (Alternative)**
- Add your domain to CloudFlare
- Enable SSL/TLS
- Use Full (strict) mode
- Free CDN included

---

## 📊 Monitoring & Logging

### Application Logs

```powershell
# View logs
docker-compose logs -f api

# Logs location
./logs/error-YYYY-MM-DD.log
./logs/combined-YYYY-MM-DD.log
```

### Health Monitoring

**Health Check Endpoint**
```bash
curl http://localhost:4000/health
```

**Setup Monitoring (Optional)**

1. **UptimeRobot** (Free)
   - Monitor health endpoint
   - Email alerts on downtime
   - https://uptimerobot.com

2. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/node
   # Add SENTRY_DSN to .env
   ```

3. **LogTail** (Log Management)
   - Centralized logging
   - Search and filters
   - https://logtail.com

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Included)

The `.github/workflows/ci-cd.yml` file provides:

✅ Automated testing on push/PR
✅ Linting and code quality checks
✅ Docker image building
✅ Automated deployment to DigitalOcean
✅ Database migrations

### Required GitHub Secrets

Add these to your repository settings:

```
DO_HOST=your-droplet-ip
DO_USERNAME=root
DO_SSH_KEY=your-private-ssh-key
```

---

## 🧪 Testing

```powershell
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

---

## 📈 Performance Optimization

### Database
- Added indexes on frequently queried fields
- Connection pooling configured
- Use `pgBouncer` for production

### API
- Compression middleware
- Rate limiting
- Efficient JSON responses

### Caching (Optional)
- Redis included in docker-compose
- Add caching layer for frequent queries

---

## 🚨 Troubleshooting

### Database Connection Issues
```powershell
# Check if Postgres is running
docker-compose ps

# View Postgres logs
docker-compose logs postgres

# Test connection
npm run prisma:studio
```

### Port Already in Use
```powershell
# Windows: Find process on port 4000
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F
```

### Docker Issues
```powershell
# Restart Docker
docker-compose restart

# Rebuild images
docker-compose up -d --build

# Clean everything
docker-compose down -v
docker system prune -a
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:4000/api/v1
Production: https://api.yourdomain.com/api/v1
```

### Authentication
```typescript
// All protected routes require Authorization header
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### Auth
```
POST /auth/register
POST /auth/login
```

#### Transactions
```
GET    /transactions
POST   /transactions
PUT    /transactions/:id
DELETE /transactions/:id
```

#### Budgets
```
GET    /budgets
POST   /budgets
```

*Full API documentation can be generated with Swagger/OpenAPI*

---

## 🎯 Next Steps

1. **Run Locally**
   ```powershell
   cd backend-production
   npm install
   docker-compose up -d
   npm run dev
   ```

2. **Choose Deployment**
   - Start with Railway (easiest)
   - Or DigitalOcean (more control)
   - Or AWS (enterprise)

3. **Connect Frontend**
   - Update Angular service URLs
   - Test authentication flow
   - Deploy frontend

4. **Monitor & Maintain**
   - Setup monitoring
   - Configure backups
   - Monitor logs

---

## 💡 Learning Resources

- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs
- **Docker Tutorial**: https://docs.docker.com/get-started/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials

---

## ❓ Need Help?

This is a production-ready backend. You can:
1. Test locally with Docker
2. Deploy to Railway in 5 minutes
3. Or follow DigitalOcean guide for full control

Run the quick start commands and let me know if you need help with any step!
