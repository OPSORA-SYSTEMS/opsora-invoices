#!/bin/bash
# Opsora Systems - Ubuntu 22.04 Server Setup Script
# Run as root: bash setup-server.sh

set -e

echo "============================================"
echo "  Opsora Systems - Server Setup"
echo "  Ubuntu 22.04 LTS"
echo "============================================"

# Update system
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# Install essentials
echo "[2/8] Installing essentials..."
apt install -y curl wget git unzip build-essential

# Install Node.js 20 via nvm
echo "[3/8] Installing Node.js 20 via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

# Add nvm to bash profile for non-interactive shells
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

# Install PM2
echo "[4/8] Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Install Nginx
echo "[5/8] Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Certbot
echo "[6/8] Installing Certbot..."
apt install -y snapd
snap install core
snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# Configure UFW firewall
echo "[7/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Create app directory
echo "[8/8] Creating application directory..."
mkdir -p /var/www/opsora-invoices
mkdir -p /var/www/opsora-invoices/data

echo ""
echo "============================================"
echo "  Server setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Clone the repository:"
echo "   cd /var/www/opsora-invoices"
echo "   git clone <your-repo-url> ."
echo ""
echo "2. Create .env file:"
echo "   cp .env.example .env"
echo "   nano .env  # Fill in your values"
echo ""
echo "3. Generate admin password hash:"
echo "   npm run hash-password <your-password>"
echo "   # Copy the hash to ADMIN_PASSWORD_HASH in .env"
echo ""
echo "4. Install dependencies and setup DB:"
echo "   npm ci"
echo "   npx prisma migrate deploy"
echo "   npm run seed"
echo ""
echo "5. Build the application:"
echo "   npm run build"
echo ""
echo "6. Start with PM2:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "7. Configure Nginx:"
echo "   cp deployment/nginx.conf /etc/nginx/sites-available/opsora-invoices"
echo "   ln -s /etc/nginx/sites-available/opsora-invoices /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "8. Setup SSL certificate:"
echo "   certbot --nginx -d invoices.opsorastystems.com"
echo ""
