# WebApp/FastAPI/Dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .

# Update this line to include uvicorn
RUN pip install --no-cache-dir -r requirements.txt uvicorn

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]