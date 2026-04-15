.PHONY: up down build logs restart db-shell app-shell clean db-generate db-migrate db-push db-seed

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

db-shell:
	docker compose exec db psql -U $${POSTGRES_USER:-clevy} -d $${POSTGRES_DB:-clevy}

app-shell:
	docker compose exec app sh

clean:
	docker compose down -v

db-generate:
	docker compose exec app npm run db:generate

db-migrate:
	docker compose exec app npm run db:migrate

db-push:
	docker compose exec app npm run db:push

db-seed:
	docker compose exec app npm run db:seed
