yarn install --frozen-lockfile
yarn tsc

read -p "Press <enter> to build Docker container"

podman image build . -f Dockerfile --tag carth-backstage:0.0.1

echo ""
echo "podman run -it -p 3000:3000 carth-backstage:0.0.1"
echo "or"
echo "podman compose -f docker-aio-compose.yml up"