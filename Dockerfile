FROM python:3.8
WORKDIR /nasa_eoo
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 3000
COPY . .
CMD ["python3", "/nasa_eoo/fetch_script.py"]