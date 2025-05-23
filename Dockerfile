# Use a slim official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy all project files to the container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask port
EXPOSE 5000

# Command to run Flask app
CMD ["python", "run.py"]
