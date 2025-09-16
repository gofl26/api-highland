#!/usr/bin/env bash
set -euo pipefail

# Usage: HARBOR_REGISTRY=harbor.ssrhouse.store HARBOR_PROJECT=myproject IMAGE_TAG=1.0.0 ./scripts/docker-build-push.sh

HARBOR_REGISTRY=${HARBOR_REGISTRY:-harbor.ssrhouse.store}
HARBOR_PROJECT=${HARBOR_PROJECT:-myproject}
IMAGE_NAME=${IMAGE_NAME:-api-highland}
IMAGE_TAG=${IMAGE_TAG:-latest}

FULL_IMAGE="${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "Ensure you're logged into Harbor if pushing: docker login ${HARBOR_REGISTRY}"

echo "Building TypeScript..."
npx tsc

echo "Building and pushing Docker image: ${FULL_IMAGE}"

# Build and push with buildx (push flag uploads to registry)
docker buildx build --platform linux/amd64 -t "${FULL_IMAGE}" --push .

if [ $? -eq 0 ]; then
	echo "Pushed ${FULL_IMAGE}"
else
	echo "Failed to build/push ${FULL_IMAGE}" >&2
	exit 1
fi
