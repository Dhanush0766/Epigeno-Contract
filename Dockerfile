# Multi-stage Dockerfile for Autonomous Contract Organism (ACO / ECG) Platform
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV HOST=0.0.0.0

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY . .
COPY --from=frontend-builder /app/backend/static ./backend/static

EXPOSE 8000

CMD ["python", "backend/run_backend.py"]
