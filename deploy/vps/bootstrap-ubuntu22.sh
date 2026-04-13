#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root."
  exit 1
fi

APP_USER="${APP_USER:-hamarsride}"
APP_ROOT="${APP_ROOT:-/var/www}"
NODE_MAJOR="${NODE_MAJOR:-22}"
DB_NAME="${DB_NAME:-hamarsride}"
DB_USER="${DB_USER:-hamarsride_app}"
DB_PASSWORD="${DB_PASSWORD:-change_me_now}"
SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY:-}"

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg lsb-release git nginx ufw postgresql postgresql-contrib certbot python3-certbot-nginx

if ! id "$APP_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$APP_USER"
fi
usermod -aG sudo "$APP_USER"

curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt-get install -y nodejs build-essential
npm install -g pm2

mkdir -p \
  "$APP_ROOT/hamarsride-user-frontend" \
  "$APP_ROOT/hamarsride-user-backend" \
  "$APP_ROOT/hamarsride-admin-frontend" \
  "$APP_ROOT/hamarsride-admin-backend" \
  "$APP_ROOT/secrets"

chown -R "$APP_USER:$APP_USER" "$APP_ROOT"

if [[ -n "$SSH_PUBLIC_KEY" ]]; then
  install -d -m 700 "/home/$APP_USER/.ssh"
  printf '%s\n' "$SSH_PUBLIC_KEY" > "/home/$APP_USER/.ssh/authorized_keys"
  chown -R "$APP_USER:$APP_USER" "/home/$APP_USER/.ssh"
  chmod 600 "/home/$APP_USER/.ssh/authorized_keys"

  install -d /etc/ssh/sshd_config.d
  cat >/etc/ssh/sshd_config.d/60-hamarsride-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
EOF
  systemctl reload ssh || systemctl reload sshd
fi

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

sudo -u postgres psql <<EOF
DO
\$do\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
   END IF;
END
\$do\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

echo "Base provisioning complete."
echo "Next: place your repo on the VPS, copy deploy/production.env.example to deploy/production.env, then run deploy/vps/deploy-production.sh as the app user."
