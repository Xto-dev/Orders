# 🛒 Orders — Microservice System for Product Tracking and Notifications

> **Orders** is a distributed system that allows users to:
> - 🔐 Register and authenticate via JWT  
> - 🛍️ Create tracking orders for products by URL  
> - 🕷️ Automatically parse current prices from websites (e.g., `ek.ua`)  
> - 📩 Receive email notifications when prices drop  
> - 📈 Horizontally scale each service independently  

The system consists of **four microservices** connected via **Apache Kafka**, with an API Gateway based on **Traefik**.

---

## 🧱 Architecture

- **auth** — User management and JWT authentication  
- **orders** — Order creation, scraping task dispatching, result processing  
- **scraper** — HTML parsing using Selenium + BeautifulSoup  
- **email** — Sending confirmations and notifications via SMTP (Gmail, SendGrid, etc.)

---

## 🚀 Quick Start

### Requirements
- Docker 24+
- Docker Compose v2.20+
- Node.js 20+
- Python 3.11+ (for local development)

### 1. Cloning
```bash
git clone https://github.com/Xto-dev/Orders.git
cd Orders
```

### 2. Configure .env

Copy and configure the environment variables:
```bash
cp .env.example .env
```
> **Be sure to set:**
>- SMTP_USER and SMTP_PASSWORD (Gmail App Password)
>- JWT_SECRET
>- POSTGRES_* credentials

### 3. Launch

```bash
docker-compose up --build
```

> **Services will be available at:**
>- Auth API: http://auth.localhost/api
>- Orders API: http://orders.localhost/api
>- Traefik Dashboard: http://localhost:8080

## 📡 Kafka Topics

| Topic  | Purpose |
| ------------- | ------------- |
| user-events  | Registration events → email confirmation  |
| scrape-requests  | Scraping tasks from orders → scraper  |
| scrape-results  | Scraping results from scraper → orders → email notification  |

## 🧪 Usage Example

### 1. Registration

```bash
curl -X POST http://auth.localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'
```

### 2. Create a price tracking order

```bash
curl -X POST http://orders.localhost/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://ek.ua/ua/METABO-POWERMAXX-BS-BASIC-600080500.htm", "targetPrice": 3200}'
```

→ The system will:

>- Create an order
>- Send a task to Kafka
>- Python scraper will extract the price
>- If price is found — send a task to Kafka
>- If target price equal or more than current price - send an Kafka event for email service

## 📦 Technologies

| Component  | Technology |
| ------------- | ------------- |
| Language | TypeScript (NestJS), Python  |
| Microservice Communication | Confluent Kafka  |
| API Gateway  | Traefik  |
| Databases  | PostgreSQL (separate for auth and orders)  |
| Cache/Idempotency | Redis  |
| Scraping  | Selenium, BeautifulSoup4 |
| Email Sending  | Nodemailer |
