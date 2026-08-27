#!/bin/bash
set -e

echo "========================================="
echo " SIH2026_ANI - PashuRaksha Starting..."
echo "========================================="

PG_DATA="/var/lib/postgresql/16/main"
PG_CONF="/etc/postgresql/16/main"

echo "[1/4] Configuring PostgreSQL..."
# Allow local trust auth
echo "local all all trust" > "${PG_CONF}/pg_hba.conf"
echo "host all all 127.0.0.1/32 trust" >> "${PG_CONF}/pg_hba.conf"
echo "host all all ::1/128 trust" >> "${PG_CONF}/pg_hba.conf"
chmod 640 "${PG_CONF}/pg_hba.conf"
chown postgres:postgres "${PG_CONF}/pg_hba.conf"

echo "[2/4] Starting PostgreSQL..."
su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D ${PG_DATA} -o '-c config_file=${PG_CONF}/postgresql.conf' -l /tmp/pg.log start -w"
sleep 3

# Setup database
echo "[3/4] Setting up database..."
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='pashuraksha_db'\"" | grep -q 1 || \
    su - postgres -c "psql -c \"CREATE DATABASE pashuraksha_db OWNER postgres;\""

su - postgres -c "psql -d pashuraksha_db -c 'CREATE EXTENSION IF NOT EXISTS postgis;'" 2>/dev/null || true
su - postgres -c "psql -d pashuraksha_db -c 'CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";'" 2>/dev/null || true

echo "    Loading schema and sample data..."
su - postgres -c "psql -d pashuraksha_db -f /app/init.sql" || echo "    (some items may already exist)"

# Verify
echo "    Verifying admin user..."
su - postgres -c "psql -d pashuraksha_db -c \"SELECT username, role FROM users LIMIT 3;\""

# Stop PostgreSQL - supervisord will restart it
su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D ${PG_DATA} stop"
sleep 2

echo "[4/4] Starting all services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
