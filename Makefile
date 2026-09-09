.PHONY: tsc install run clean run-prod pod-up pod-down prettier lint

tsc:
	yarn tsc

run:
	export $$(grep -v '^#' .env | xargs) && NODE_OPTIONS="--max-old-space-size=1000 --no-node-snapshot" && yarn start

run-prod:
	export $$(grep -v '^#' .env | xargs) && NODE_OPTIONS="--max-old-space-size=1000 --no-node-snapshot" && NODE_ENV=production && LOG_LEVEL=warn yarn start 

install:
	BACKSTAGE_MANIFEST_FILE=./backstage-manifest.json yarn install

clean:
	rm -rf node_modules
	rm yarn.lock

pod-up:
	podman compose -f docker-db-compose.yml up -d

pod-down:
	podman compose -f docker-db-compose.yml down

prettier:
	yarn prettier:check --write .

lint:
	yarn lint:all