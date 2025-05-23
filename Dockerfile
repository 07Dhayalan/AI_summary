# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy all files to container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Flask will run on
EXPOSE 5000

# Set the command to run the app
CMD ["python", "run.py"]
