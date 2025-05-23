FROM python
WORKDIR /run
COPY . /run
CMD ["python3","run.py"]