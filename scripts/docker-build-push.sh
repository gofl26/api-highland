#!/usr/bin/env bash
set -euo pipefail

# Usage: HARBOR_REGISTRY=harbor.ssrhouse.store HARBOR_PROJECT=myproject IMAGE_TAG=1.0.0 ./scripts/docker-build-push.sh

HARBOR_REGISTRY=${HARBOR_REGISTRY:-harbor.ssrhouse.store}
HARBOR_PROJECT=${HARBOR_PROJECT:-myproject}
IMAGE_NAME=${IMAGE_NAME:-api-highland}
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD || echo "local")}

FULL_IMAGE="${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building TypeScript..."
npx tsc

echo "Building Docker image: ${FULL_IMAGE}"

docker buildx build --platform linux/amd64 -t "${FULL_IMAGE}" --push .

echo "Please login to Harbor if not already: docker login ${HARBOR_REGISTRY}"

echo "Pushing image: ${FULL_IMAGE}"
docker push "${FULL_IMAGE}"

echo "Pushed ${FULL_IMAGE}"
