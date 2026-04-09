FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && python manage.py migrate && python -m scripts.bootstrap && python -m scripts.seed_demo_data && gunicorn phishing_detector.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 3 --timeout 120"]
