import math
import json
import time
from kafka import KafkaConsumer, KafkaProducer
import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
kafka_broker = os.getenv('KAFKA_BROKER')
timeout = int(os.getenv('SCRAPER_TIMEOUT', 5))
user_agent = os.getenv('USER_AGENT')

def wait_for_kafka(broker: str, max_retries=30):
    for i in range(max_retries):
        print(i)
        try:
            from kafka import KafkaProducer
            prod = KafkaProducer(bootstrap_servers=[broker])
            prod.close()
            logger.info(f"✅ Kafka is ready: {broker}")
            return True
        except Exception as e:
            logger.warning(f"⏳ Waiting for Kafka ({i+1}/{max_retries})... {e}")
            time.sleep(2)
    raise Exception("Kafka is not available after maximum retries")

wait_for_kafka(kafka_broker)

consumer = KafkaConsumer(
    'scrape-requests',
    bootstrap_servers=[kafka_broker],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id='scraper-group'
)

producer = KafkaProducer(
    bootstrap_servers=['kafka:29092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def scrape_price(url: str) -> float:
    try:
        response = requests.get(url, headers={'User-Agent': user_agent}, timeout=timeout)
        soup = BeautifulSoup(response.text, 'lxml')

        price_div = soup.find('div', {'class': 'desc-big-price  ib'})
        if not price_div:
            return 0.0
        
        spans = price_div.find_all('span')
        min_price = math.inf
        for span in spans:
            price = float(span.text.replace('$', '').strip())
            min_price = min(min_price, price)

        return min_price
    except Exception as e:
        logger.error(f"Scraping error: {e}")
        return 0.0

logger.info("🐍 Scraper started, waiting for tasks...")

for msg in consumer:
    try:
        task = msg.value
        logger.info(f"Received task: {task}")
        url = task.get('url')
        request_id = task.get('requestId')
        
        price = scrape_price(url)
        
        result = {
            'requestId': request_id,
            'url': url,
            'price': price,
            'status': 'completed' if price > 0 else 'failed'
        }
        
        producer.send('scrape-results', value=result)
        logger.info(f"Result sent: {result}")
    except Exception as e:
        logger.error(f"Error processing task: {e}")