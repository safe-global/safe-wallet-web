#!/bin/bash

set -euo pipefail

export DOCKER_BUILDKIT=1

if [ "$1" = "dev" -o "$1" = "main" ]; then
    # If image does not exist, don't use cache
    docker pull safeglobal/$DOCKERHUB_PROJECT:$1 && \
    docker build -t $DOCKERHUB_PROJECT . --cache-from safeglobal/$DOCKERHUB_PROJECT:$1 --build-arg BUILDKIT_INLINE_CACHE=1 || \
    docker build -t $DOCKERHUB_PROJECT . --build-arg BUILDKIT_INLINE_CACHE=1
else
    # Building tag version from staging image (vX.X.X)
    docker pull safeglobal/$DOCKERHUB_PROJECT:staging && \
    docker build -t $DOCKERHUB_PROJECT . --cache-from safeglobal/$DOCKERHUB_PROJECT:staging --build-arg BUILDKIT_INLINE_CACHE=1 || \
    docker build -t $DOCKERHUB_PROJECT . --build-arg BUILDKIT_INLINE_CACHE=1
    # Only push latest on release
    case $1 in v*)
        docker tag $DOCKERHUB_PROJECT safeglobal/$DOCKERHUB_PROJECT:latest
        docker push safeglobal/$DOCKERHUB_PROJECT:latest
    esac
fi
docker tag $DOCKERHUB_PROJECT safeglobal/$DOCKERHUB_PROJECT:$1
docker push safeglobal/$DOCKERHUB_PROJECT:$1
