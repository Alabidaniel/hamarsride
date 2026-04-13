#!/usr/bin/env bash
set -euo pipefail

SOURCE_ROOT="${SOURCE_ROOT:-$(pwd)}"
APP_ROOT="${APP_ROOT:-/var/www}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$SOURCE_ROOT/deploy/production.env}"
PM2_CONFIG="${PM2_CONFIG:-$SOURCE_ROOT/deploy/ecosystem.config.cjs}"
NGINX_TEMPLATE="${NGINX_TEMPLATE:-$SOURCE_ROOT/deploy/nginx.conf.example}"
NGINX_TARGET="/etc/nginx/sites-available/hamarsride.conf"

if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
fi

DOMAIN="${DOMAIN:?Set DOMAIN in deploy/production.env}"
WWW_DOMAIN="${WWW_DOMAIN:-www.$DOMAIN}"
API_DOMAIN="${API_DOMAIN:?Set API_DOMAIN in deploy/production.env}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:?Set ADMIN_DOMAIN in deploy/production.env}"
ADMIN_API_DOMAIN="${ADMIN_API_DOMAIN:?Set ADMIN_API_DOMAIN in deploy/production.env}"

DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER:-hamarsride_app}:${POSTGRES_PASSWORD:-change_me_now}@${POSTGRES_HOST:-127.0.0.1}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-hamarsride}}"
USER_BACKEND_PORT="${USER_BACKEND_PORT:-5000}"
ADMIN_BACKEND_PORT="${ADMIN_BACKEND_PORT:-5001}"
USER_API_BASE_URL="${USER_API_BASE_URL:-https://${API_DOMAIN}/api}"
ADMIN_API_BASE_URL="${ADMIN_API_BASE_URL:-https://${ADMIN_API_DOMAIN}}"
JWT_SECRET="${JWT_SECRET:-change_me_now}"
USER_CORS_ORIGINS="${USER_CORS_ORIGINS:-https://${DOMAIN},https://${WWW_DOMAIN},https://${ADMIN_DOMAIN}}"
ADMIN_CORS_ORIGINS="${ADMIN_CORS_ORIGINS:-https://${ADMIN_DOMAIN}}"
USER_UPLOADS_DIR="${USER_UPLOADS_DIR:-/var/www/hamarsride-user-backend/uploads}"
ADMIN_UPLOADS_DIR="${ADMIN_UPLOADS_DIR:-/var/www/hamarsride-admin-backend/uploads}"

USER_FRONTEND_SRC="$SOURCE_ROOT/hamarsride-user/HamarsRide"
USER_BACKEND_SRC="$SOURCE_ROOT/hamarsride-user/hamarsride-backend"
ADMIN_FRONTEND_SRC="$SOURCE_ROOT/hamarsride-admin/hamarsride-admin-frontend"
ADMIN_BACKEND_SRC="$SOURCE_ROOT/hamarsride-admin/hamarsride-admin-backend"

mkdir -p "$APP_ROOT"

ln -sfnT "$USER_FRONTEND_SRC" "$APP_ROOT/hamarsride-user-frontend"
ln -sfnT "$USER_BACKEND_SRC" "$APP_ROOT/hamarsride-user-backend"
ln -sfnT "$ADMIN_FRONTEND_SRC" "$APP_ROOT/hamarsride-admin-frontend"
ln -sfnT "$ADMIN_BACKEND_SRC" "$APP_ROOT/hamarsride-admin-backend"
mkdir -p "$APP_ROOT/secrets"

if [[ -f "$SOURCE_ROOT/serviceAccountKey.json" ]]; then
  install -m 600 "$SOURCE_ROOT/serviceAccountKey.json" "$APP_ROOT/secrets/serviceAccountKey.json"
elif [[ -f "$SOURCE_ROOT/_secrets_backup/serviceAccountKey.json" ]]; then
  install -m 600 "$SOURCE_ROOT/_secrets_backup/serviceAccountKey.json" "$APP_ROOT/secrets/serviceAccountKey.json"
fi

cat >"$USER_BACKEND_SRC/.env" <<EOF
PORT=${USER_BACKEND_PORT}
DATABASE_URL="${DATABASE_URL}"
GOOGLE_APPLICATION_CREDENTIALS=${APP_ROOT}/secrets/serviceAccountKey.json
JWT_SECRET=${JWT_SECRET}
CORS_ORIGINS=${USER_CORS_ORIGINS}
PAYMENT_BANK_NAME=${PAYMENT_BANK_NAME:-OPay}
PAYMENT_ACCOUNT_NAME=${PAYMENT_ACCOUNT_NAME:-HAMARS RIDES AND TRANSPORT SERVICES}
PAYMENT_ACCOUNT_NUMBER=${PAYMENT_ACCOUNT_NUMBER:-6115535987}
USER_UPLOADS_DIR=${USER_UPLOADS_DIR}
EOF

cat >"$ADMIN_BACKEND_SRC/.env" <<EOF
PORT=${ADMIN_BACKEND_PORT}
DATABASE_URL="${DATABASE_URL}"
GOOGLE_APPLICATION_CREDENTIALS=${APP_ROOT}/secrets/serviceAccountKey.json
CORS_ORIGINS=${ADMIN_CORS_ORIGINS}
ADMIN_UPLOADS_DIR=${ADMIN_UPLOADS_DIR}
EOF

cat >"$USER_FRONTEND_SRC/.env.production" <<EOF
VITE_API_BASE_URL=${USER_API_BASE_URL}
EOF

cat >"$ADMIN_FRONTEND_SRC/.env.production" <<EOF
VITE_API_BASE_URL=${ADMIN_API_BASE_URL}
EOF

pushd "$USER_BACKEND_SRC" >/dev/null
npm ci
npx prisma generate
npx prisma migrate deploy
popd >/dev/null

pushd "$ADMIN_BACKEND_SRC" >/dev/null
npm ci
npx prisma generate
popd >/dev/null

pushd "$USER_FRONTEND_SRC" >/dev/null
npm ci
npm run build
popd >/dev/null

pushd "$ADMIN_FRONTEND_SRC" >/dev/null
npm ci
npm run build
popd >/dev/null

install -Dm644 "$NGINX_TEMPLATE" "$NGINX_TARGET"
sed -i \
  -e "s/__DOMAIN__/${DOMAIN}/g" \
  -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
  -e "s/__API_DOMAIN__/${API_DOMAIN}/g" \
  -e "s/__ADMIN_DOMAIN__/${ADMIN_DOMAIN}/g" \
  -e "s/__ADMIN_API_DOMAIN__/${ADMIN_API_DOMAIN}/g" \
  "$NGINX_TARGET"

ln -sfn "$NGINX_TARGET" /etc/nginx/sites-enabled/hamarsride.conf
nginx -t
systemctl reload nginx

export HAMARSRIDE_ROOT="$SOURCE_ROOT"
pm2 startOrReload "$PM2_CONFIG" --update-env
pm2 save

if [[ -n "${LE_EMAIL:-}" ]]; then
  certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "$LE_EMAIL" \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" \
    -d "$API_DOMAIN" \
    -d "$ADMIN_DOMAIN" \
    -d "$ADMIN_API_DOMAIN" \
    --redirect
fi

echo "Deployment complete."
