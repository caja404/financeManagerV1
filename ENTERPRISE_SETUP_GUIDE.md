# 🎓 Enterprise Backend Learning Guide
## Path 3: Professional Production Setup

You've chosen the most comprehensive path! This guide will teach you enterprise-grade backend development from scratch.

---

## 📋 What You've Got

I've created a **production-ready backend** in the `backend-production/` folder with:

### ✅ Enterprise Features
- ✨ TypeScript with strict type checking
- 🔒 Security hardened (Helmet, CORS, Rate Limiting)
- 📝 Professional logging (Winston with rotation)
- 🐳 Docker containerization
- 🚀 CI/CD pipeline (GitHub Actions)
- 🗄️ PostgreSQL with Prisma ORM
- 🔐 JWT authentication
- ✅ Input validation (Zod)
- 🔄 Error handling
- 📊 Health monitoring

---

## 🎯 Learning Path

### Phase 1: Understand the Code (30-60 minutes)

#### 1.1 Read the Architecture
```
Open: backend-production/README.md
```
**What to Learn:**
- How Express.js handles HTTP requests
- Middleware pattern (auth, error handling, logging)
- Dependency injection with Prisma
- Environment configuration

#### 1.2 Study Key Files

**Start Here:**
```typescript
// 1. Entry point
backend-production/src/index.ts
- Server initialization
- Middleware setup
- Route registration

// 2. Authentication
backend-production/src/routes/auth.routes.ts
- Password hashing with bcrypt
- JWT token generation
- Input validation

// 3. Protected Routes
backend-production/src/routes/transaction.routes.ts
- Authorization checking
- CRUD operations
- Database queries
```

**Key Concepts to Understand:**

1. **Middleware Flow**
```
Request → CORS → Helmet → Body Parser → Rate Limiter → Routes → Error Handler → Response
```

2. **Authentication Flow**
```
Login → Verify Password → Generate JWT → Return Token
Request → Extract Token → Verify JWT → Attach UserId → Process Request
```

3. **Error Handling**
```
Try/Catch → ApiError → Global Error Handler → Standard JSON Response
```

---

### Phase 2: Run Locally (30 minutes)

#### 2.1 Install Dependencies
```powershell
cd backend-production
npm install
```

**What This Installs:**
- Express: Web framework
- Prisma: Database ORM
- bcrypt: Password hashing
- jsonwebtoken: Authentication
- winston: Logging
- zod: Validation
- helmet: Security headers
- And more...

#### 2.2 Setup Database

**Option A: Docker (Easiest)**
```powershell
# Start PostgreSQL
docker-compose up -d postgres

# Check it's running
docker-compose ps
```

**Option B: Local PostgreSQL**
1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password!
4. Create database:
   ```powershell
   psql -U postgres
   CREATE DATABASE financemonitor;
   \q
   ```

#### 2.3 Configure Environment
```powershell
# Copy example
cp .env.example .env

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env and paste the generated secret
notepad .env
```

Update these values:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/financemonitor"
JWT_SECRET="paste-the-generated-secret-here"
```

#### 2.4 Run Migrations
```powershell
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create database tables
```

**What This Does:**
- Reads `prisma/schema.prisma`
- Creates all database tables
- Sets up indexes and relationships

#### 2.5 Start Development Server
```powershell
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🚀 Server Started Successfully!      ║
╠════════════════════════════════════════╣
║  Environment: development              ║
║  Port: 4000                            ║
║  API Version: v1                       ║
║  URL: http://localhost:4000            ║
╚════════════════════════════════════════╝
```

#### 2.6 Test the API

**Health Check:**
```powershell
curl http://localhost:4000/health
```

**Register a User:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    email = "test@example.com"
    password = "Test123456"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/register" -Method Post -Headers $headers -Body $body
```

You'll get back:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

**Create Transaction (Protected Route):**
```powershell
$token = "YOUR_TOKEN_FROM_REGISTER"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
$body = @{
    date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    description = "Test Transaction"
    amount = 100.50
    category = "Food"
    type = "expense"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/v1/transactions" -Method Post -Headers $headers -Body $body
```

🎉 **If these work, your backend is running perfectly!**

---

### Phase 3: Docker Concepts (1-2 hours)

#### 3.1 What is Docker?

**Simple Analogy:**
- Docker is like a shipping container for your app
- Contains everything needed to run (code, dependencies, OS)
- Works the same everywhere (your laptop, server, cloud)

#### 3.2 Key Docker Files

**Dockerfile** - Recipe to build your app container
```dockerfile
# Start with Node.js
FROM node:20-alpine

# Copy your code
COPY . /app

# Install dependencies
RUN npm install

# Start the app
CMD ["node", "dist/index.js"]
```

**docker-compose.yml** - Run multiple containers together
```yaml
services:
  postgres:    # Database container
  api:         # Your backend container
  redis:       # Cache container (optional)
```

#### 3.3 Basic Docker Commands

```powershell
# Start all services
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Enter container shell
docker-compose exec api sh
```

#### 3.4 Practice Exercise

1. Make a code change in `src/index.ts`
2. Rebuild: `docker-compose up -d --build`
3. Check logs: `docker-compose logs -f api`
4. Test the change

---

### Phase 4: Deployment to DigitalOcean (2-3 hours)

#### 4.1 Why DigitalOcean?
- **Simple:** Much easier than AWS
- **Affordable:** $10-20/month
- **Learning:** Good for understanding servers
- **Control:** Full server access

#### 4.2 Setup Steps

**Step 1: Create Account**
1. Visit https://www.digitalocean.com
2. Sign up (you may get $200 free credit)
3. Add payment method

**Step 2: Create Droplet (Virtual Server)**
1. Click "Create" → "Droplets"
2. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($12/month, 2GB RAM)
   - **Region:** Closest to your users
   - **Authentication:** SSH Key (generate one)
3. Click "Create Droplet"
4. Wait 60 seconds for server to start

**Step 3: Generate SSH Key (Windows)**
```powershell
# Open PowerShell
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# Press Enter 3 times (default settings)

# View your public key
cat ~/.ssh/id_rsa.pub
```
Copy this and add it to DigitalOcean when creating droplet.

**Step 4: Connect to Server**
```powershell
# Replace with your droplet IP
ssh root@YOUR_DROPLET_IP
```

**Step 5: Install Docker on Server**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify
docker --version
docker-compose --version
```

**Step 6: Deploy Your App**
```bash
# Create directory
mkdir -p /var/www/financemonitor-api
cd /var/www/financemonitor-api

# Clone your code (or upload manually)
git clone YOUR_GITHUB_REPO_URL .

# Create .env file
nano .env
# Paste your production environment variables
# Press Ctrl+X, then Y, then Enter to save

# Start services
docker-compose up -d

# Run migrations
docker-compose exec api npm run prisma:migrate

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Step 7: Configure Firewall**
```bash
ufw allow 22     # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable
```

**Step 8: Setup Domain (Optional)**
1. Buy domain (Namecheap, Google Domains)
2. Add A record:
   - Name: api
   - Value: YOUR_DROPLET_IP
3. Wait 5-10 minutes for DNS propagation

**Step 9: Setup HTTPS**
```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/financemonitor
```

Paste:
```nginx
server {
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
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/financemonitor /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Install SSL certificate
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yourdomain.com
```

🎉 **Your API is now live at `https://api.yourdomain.com`!**

---

### Phase 5: CI/CD Pipeline (1-2 hours)

#### 5.1 What is CI/CD?

**CI (Continuous Integration):**
- Automatically test code when you push to GitHub
- Catch bugs early

**CD (Continuous Deployment):**
- Automatically deploy to server after tests pass
- No manual deployment needed

**Your Pipeline:**
```
Push to GitHub → Run Tests → Build Docker Image → Deploy to Server → Run Migrations
```

#### 5.2 Setup GitHub Actions

**Step 1: Push Code to GitHub**
```powershell
cd backend-production
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

**Step 2: Add Secrets to GitHub**
1. Go to your repo on GitHub
2. Settings → Secrets and variables → Actions
3. Add New Repository Secret:
   - `DO_HOST`: Your droplet IP
   - `DO_USERNAME`: root
   - `DO_SSH_KEY`: Paste content of `~/.ssh/id_rsa`

**Step 3: Make a Change and Push**
```powershell
# Edit any file
notepad src/index.ts

# Commit and push
git add .
git commit -m "Update message"
git push
```

**Step 4: Watch the Magic**
1. Go to GitHub → Actions tab
2. See your workflow running
3. Tests → Build → Deploy automatically!

---

### Phase 6: Monitoring & Maintenance (Ongoing)

#### 6.1 Setup Monitoring

**Uptime Monitoring (Free)**
1. Visit https://uptimerobot.com
2. Sign up
3. Add monitor:
   - Type: HTTP(s)
   - URL: https://api.yourdomain.com/health
   - Interval: 5 minutes
4. Get email alerts on downtime

**Error Tracking with Sentry**
```powershell
npm install @sentry/node
```

Add to your code:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### 6.2 View Logs
```bash
# SSH to server
ssh root@YOUR_DROPLET_IP

# View logs
cd /var/www/financemonitor-api
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100 api
```

#### 6.3 Database Backups

**Automatic Daily Backups:**
```bash
# Create backup script
nano /root/backup-db.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres financemonitor > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Add to crontab (run daily at 2am)
crontab -e
# Add this line:
0 2 * * * /root/backup-db.sh
```

---

## 🎓 What You'll Learn

### Backend Development
- ✅ RESTful API design
- ✅ Authentication & authorization
- ✅ Database design & queries
- ✅ Error handling
- ✅ Input validation
- ✅ Security best practices

### DevOps & Infrastructure
- ✅ Docker containerization
- ✅ Linux server administration
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS setup
- ✅ CI/CD pipelines
- ✅ Monitoring & logging

### Production Operations
- ✅ Deployment strategies
- ✅ Database migrations
- ✅ Backup & recovery
- ✅ Performance optimization
- ✅ Troubleshooting

---

## 📚 Learning Resources

### Tutorials
- **Node.js**: https://nodejs.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Docker**: https://docs.docker.com/get-started/
- **DigitalOcean**: https://www.digitalocean.com/community/tutorials

### Books
- "Node.js Design Patterns" by Mario Casciaro
- "Docker Deep Dive" by Nigel Poulton
- "The DevOps Handbook" by Gene Kim

### YouTube Channels
- Traversy Media
- Fireship
- TechWorld with Nana

---

## ✅ Your Next Steps

### Immediate (Today)
1. ✅ Run backend locally
2. ✅ Test all API endpoints
3. ✅ Understand the code structure

### This Week
1. ✅ Deploy to DigitalOcean
2. ✅ Setup HTTPS
3. ✅ Configure monitoring

### This Month
1. ✅ Setup CI/CD pipeline
2. ✅ Connect frontend to backend
3. ✅ Add more features
4. ✅ Implement full test coverage

---

## 💡 Pro Tips

1. **Start Simple**: Get it working locally first
2. **Use Docker**: Makes deployment much easier
3. **Monitor Everything**: Catch issues before users do
4. **Automate**: CI/CD saves tons of time
5. **Document**: Future you will thank you
6. **Backup**: Test your backups regularly
7. **Security**: Keep dependencies updated

---

## ❓ Common Questions

**Q: Do I need to delete the existing server folder?**
A: Not yet! Test this new one first. Once you're comfortable, you can remove the old one.

**Q: Which deployment should I choose?**
A: Start with Railway (easiest), then move to DigitalOcean when you want more control.

**Q: How much will this cost?**
- Railway: Free tier available
- DigitalOcean: $10-20/month
- AWS: Variable, can get expensive

**Q: Is this overkill for learning?**
A: This IS how professionals build backends. You're learning the real way!

**Q: What if something breaks?**
A: Check logs first, then GitHub issues, Stack Overflow. I'm here to help too!

---

## 🚀 Ready to Start?

### Quick Start Command:
```powershell
cd backend-production
npm install
docker-compose up -d postgres
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Then test: http://localhost:4000/health

**Let me know when you're ready and which part you want to tackle first!**

---

Good luck on your enterprise backend journey! 🎉
