# Stage 1: Build Angular frontend
FROM node:20-slim AS angular-builder

LABEL stage=angular-builder

# Set working directory for Angular app
WORKDIR /app/game24_app

# Copy package files and install dependencies
COPY game24_app/package.json game24_app/package-lock.json ./
RUN npm ci

# Copy the rest of the Angular app source
COPY game24_app/ ./

# Build the Angular app for production.
# The output will be in /app/game24_app/dist/game24-angular-ext/browser
RUN npm run build -- --configuration production


# Stage 2: Build Python backend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DEBUG False

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project
COPY core/ ./core/
COPY game24_server/ ./game24_server/
COPY manage.py .

# Copy built Angular files from the angular-builder stage
COPY --from=angular-builder /app/game24_app/dist/game24-angular-ext/browser /app/game24_app/dist/game24-angular-ext/browser

# Run collectstatic
RUN python manage.py collectstatic --noinput

# Cloud Run exposes the port it expects the app to listen on via the PORT env var.
EXPOSE 8080

# Run the application with Gunicorn
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --threads 8 --timeout 0 core.wsgi:application
