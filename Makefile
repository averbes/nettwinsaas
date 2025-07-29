.PHONY: dev test lint build clean logs coverage help

# Variables
COMPOSE_FILE := docker-compose.yml
SERVICES := collector topology-builder what-if-engine config-generator ui

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}\' $(MAKEFILE_LIST)

dev: ## Start development environment
	@echo "🚀 Starting NetTwinSaaS development environment..."
	docker compose -f $(COMPOSE_FILE) up --build

dev-d: ## Start development environment in detached mode
	@echo "🚀 Starting NetTwinSaaS development environment (detached)..."
	docker compose -f $(COMPOSE_FILE) up --build -d

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker compose -f $(COMPOSE_FILE) down

clean: ## Clean up containers, networks, and volumes
	@echo "🧹 Cleaning up..."
	docker compose -f $(COMPOSE_FILE) down --volumes --rmi all
	docker system prune -f

build: ## Build all Docker images
	@echo "🔨 Building all images..."
	docker compose -f $(COMPOSE_FILE) build

rebuild: ## Rebuild all images from scratch
	@echo "🔨 Rebuilding all images from scratch..."
	docker compose -f $(COMPOSE_FILE) build --no-cache

logs: ## Show logs for all services
	docker compose -f $(COMPOSE_FILE) logs -f

logs-ui: ## Show UI service logs
	docker compose -f $(COMPOSE_FILE) logs -f ui

logs-api: ## Show API services logs
	docker compose -f $(COMPOSE_FILE) logs -f what-if-engine topology-builder config-generator collector

test: ## Run tests for all Python services
	@echo "🧪 Running tests..."
	@for service in $(SERVICES); do \
		if [ -f "services/$$service/requirements-dev.txt" ]; then \
			echo "Testing $$service..."; \
			docker compose exec $$service python -m pytest tests/ -v || true; \
		fi \
	done

test-what-if: ## Run tests for what-if-engine with coverage
	@echo "🧪 Running what-if-engine tests with coverage..."
	docker compose exec what-if-engine python -m pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

coverage: ## Generate coverage reports
	@echo "📊 Generating coverage reports..."
	docker compose exec what-if-engine python -m pytest tests/ --cov=app --cov-report=html --cov-report=term-missing
	@echo "Coverage report generated in htmlcov/"

lint: ## Run linting for all Python services
	@echo "🔍 Running linting..."
	@for service in $(SERVICES); do \
		if [ -f "services/$$service/pyproject.toml" ] || [ -f "services/$$service/setup.cfg" ]; then \
			echo "Linting $$service..."; \
			docker compose exec $$service python -m flake8 app/ || true; \
			docker compose exec $$service python -m black --check app/ || true; \
			docker compose exec $$service python -m isort --check-only app/ || true; \
		fi \
	done

format: ## Format code for all Python services
	@echo "✨ Formatting code..."
	@for service in $(SERVICES); do \
		if [ -f "services/$$service/pyproject.toml" ] || [ -f "services/$$service/setup.cfg" ]; then \
			echo "Formatting $$service..."; \
			docker compose exec $$service python -m black app/ || true; \
			docker compose exec $$service python -m isort app/ || true; \
		fi \
	done

shell-what-if: ## Open shell in what-if-engine container
	docker compose exec what-if-engine bash

shell-topology: ## Open shell in topology-builder container
	docker compose exec topology-builder bash

shell-collector: ## Open shell in collector container
	docker compose exec collector bash

ps: ## Show running containers
	docker compose -f $(COMPOSE_FILE) ps

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ UI: OK" || echo "❌ UI: FAIL"
	curl -f http://localhost:8001/health > /dev/null 2>&1 && echo "✅ What-If Engine: OK" || echo "❌ What-If Engine: FAIL"
	curl -f http://localhost:8002/health > /dev/null 2>&1 && echo "✅ Topology Builder: OK" || echo "❌ Topology Builder: FAIL"
	curl -f http://localhost:8003/health > /dev/null 2>&1 && echo "✅ Config Generator: OK" || echo "❌ Config Generator: FAIL"
	curl -f http://localhost:8004/health > /dev/null 2>&1 && echo "✅ Collector: OK" || echo "❌ Collector: FAIL"

demo: ## Run complete demo flow
	@echo "🎬 Running NetTwinSaaS demo..."
	@echo "1. Discovering network topology..."
	curl -X POST http://localhost:8002/api/v1/discover \
		-H "Authorization: Bearer demo-token\" \
		-H \"Content-Type: application/json\" \
		-d '{\"network_range": "192.168.1.0/24"}' || true
	@sleep 2
	@echo -e "\n2. Running what-if simulation..."
	curl -X POST http://localhost:8001/api/v1/simulate \
		-H "Authorization: Bearer demo-token\" \
		-H \"Content-Type: application/json\" \
		-d '{\"action":"add_link","src":"R1","dst":"R3","capacity":1000}' || true
	@sleep 2
	@echo -e "\n3. Generating configurations..."
	curl -X POST http://localhost:8003/api/v1/generate \
		-H "Authorization: Bearer demo-token\" \
		-H \"Content-Type: application/json\" \
		-d '{\"simulation_id":"sim-001","dry_run":true}' || true

install-deps: ## Install local development dependencies
	@echo "📦 Installing local development dependencies..."
	pip install -r requirements-dev.txt

setup: ## Initial setup for development
	@echo "⚙️ Setting up NetTwinSaaS for development..."
	cp .env.example .env
	@echo "✅ Environment file created"
	@echo "🚀 Run 'make dev' to start the development environment"

local: ## Start local development without Docker
	@echo "🚀 Starting NetTwinSaaS in local development mode..."
	@if [ ! -f "local-dev/backend/main.py" ]; then \
		echo "❌ Local setup not found. Run './local-setup.sh' first"; \
		exit 1; \
	fi
	@chmod +x local-dev/start-dev.sh
	./local-dev/start-dev.sh

setup-local: ## Setup local development environment
	@echo "⚙️ Setting up local development environment..."
	@chmod +x local-setup.sh
	./local-setup.sh

backup-data: ## Backup database data
	@echo "💾 Backing up database data..."
	docker compose exec neo4j neo4j-admin dump --to=/data/backup.dump
	docker compose exec clickhouse clickhouse-client --query="BACKUP DATABASE nettwin TO Disk('backups', 'nettwin_backup')"

restore-data: ## Restore database data
	@echo "🔄 Restoring database data..."
	docker compose exec neo4j neo4j-admin load --from=/data/backup.dump --force
	docker compose exec clickhouse clickhouse-client --query="RESTORE DATABASE nettwin FROM Disk('backups', 'nettwin_backup')"