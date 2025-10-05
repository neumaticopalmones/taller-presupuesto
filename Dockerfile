FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema para psycopg2 y locales
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements desde backend/
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY backend/ ./backend/
COPY frontend-backup/ ./frontend-backup/

# Copiar y hacer ejecutable el script de inicio
COPY start.sh ./
RUN chmod +x start.sh

ENV FLASK_ENV=production \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=5000

EXPOSE 5000

CMD ["./start.sh"]
