FROM python:3.11-slim
WORKDIR /app

# System deps for Pillow/torch runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# App code + model (models/*.pth is gitignored but present in build context)
COPY . .

EXPOSE 5000
CMD ["python", "server.py"]
