FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema para psycopg2 y locales
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_ENV=development \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=5000

EXPOSE 5000

CMD ["python", "app.py"]
