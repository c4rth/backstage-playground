yarn install --frozen-lockfile
yarn tsc
yarn build:backend --config ../../app-config.yaml

read -p "Press <enter> to build Docker container"
docker image build . -f Dockerfile --tag carth-backstage:0.0.1

echo ""
echo "docker run -it -p 3000:3000 carth-backstage:0.0.1"
echo "or"
echo "docker compose up"