#!/usr/bin/env bash

# exit on errors, undefined variables, ensure errors in pipes are not hidden
set -Eeuo pipefail

: ${1:?"1st parameter <version> missing"}
: ${1:?"2nd parameter <repository> missing"}

declare version repository
version="${1}"
repository="${2}"

helm package charts/safe-wallet-web --version "${version}"

helm push "safe-wallet-web-${version}.tgz" "${repository}"
