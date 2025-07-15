docker image build . -f Dockerfile-orig --tag carth-backstage:0.0.1 --progress=plain

echo ""
echo "docker run -it -p 3000:3000 carth-backstage:0.0.1"
echo "or"
echo "docker compose -f docker-aio-compose.yml up"