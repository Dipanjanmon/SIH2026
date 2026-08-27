# ===== Stage 1: Build Frontend =====
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ===== Stage 2: Build Backend =====
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn package -DskipTests -B

# ===== Stage 3: Install Python deps =====
FROM python:3.10-slim AS ai-builder
WORKDIR /app
COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ===== Stage 4: Final All-in-One =====
FROM eclipse-temurin:21-jammy

ENV DEBIAN_FRONTEND=noninteractive

# Add PostgreSQL PGDG repo
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg lsb-release && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
    gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] \
    http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > \
    /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && apt-get install -y \
    postgresql-16 \
    postgresql-16-postgis-3 \
    nginx \
    supervisor \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create required directories
RUN mkdir -p /var/run/postgresql /app /var/log/supervisord /var/run

# Copy built artifacts
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY --from=backend-builder /app/target/*.jar /app/backend.jar
COPY --from=ai-builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/dist-packages
COPY --from=ai-builder /usr/local/bin /usr/local/bin

# Copy application files
COPY ai-service/*.py /app/ai-service/
COPY database/init.sql /app/init.sql
COPY nginx-all-in-one.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
