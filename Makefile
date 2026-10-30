.PHONY: tsc install run clean run-prod podman prettier lint

tsc:
	yarn tsc

run:
	export $$(grep -v '^#' .env | xargs) && \
	NODE_OPTIONS="--max-old-space-size=1000 --no-node-snapshot" \
	yarn start

run-prod:
	export $$(grep -v '^#' .env | xargs) && \
	NODE_OPTIONS="--max-old-space-size=1000 --no-node-snapshot" \
	NODE_ENV=production \
	LOG_LEVEL=warn \
	yarn start 

install:
	BACKSTAGE_MANIFEST_FILE=./backstage-manifest.json yarn install

clean:
	yarn clean
	rm -rf node_modules yarn.lock

podman:
	podman compose -f docker-db-compose.yml $(word 2,$(MAKECMDGOALS))

prettier:
	yarn prettier:check --write .

lint:
	yarn lint:all

# Prevent make from treating arguments as separate file targets
%:
	@: