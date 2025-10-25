SHA256_HASH="073e7c8b84e2197f94c8083634640ab37105effe1bc853ca4d5fbece3219b0e8"
NAMESPACE='library'
REPO_NAME='postgres'

for i in {1..1000}; do 
    if [ $i -eq 100 ]; then
        echo -e "\e[35mSleeping for 7 seconds on page $i...\e[0m"
        sleep 7
    fi

    echo "Looking into page: $i"

    result=$(
        curl -s "https://registry.hub.docker.com/v2/repositories/$NAMESPACE/$REPO_NAME/tags/?page=$i" \
        | jq -r ".results[] | select(.[\"images\"][][\"digest\"] == \"sha256:$SHA256_HASH\" or .digest == \"sha256:$SHA256_HASH\")"
    ) || break

    if [ ! -z "$result" ]; then
        echo "$result" | jq '.'
        break
    fi
done