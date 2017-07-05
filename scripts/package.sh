#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


PROJECT_NAME=$(node -p "require('./package').name")
PROJECT_VERSION=$(node -p "require('./package').version")
ARCHIVE_FILENAME="$PROJECT_NAME-$PROJECT_VERSION.zip"
NODE_ENV=${NODE_ENV:=production}

export NODE_ENV


./scripts/compile.sh "$@"

echo -e "\nBuilding archive at '$ARCHIVE_FILENAME'...\n"

cd dist
cp ../nginx.conf .

zip -r "$ARCHIVE_FILENAME" . -x "$ARCHIVE_FILENAME"
