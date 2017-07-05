#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


echo "Cleaning up"
rm -rfv \
    dist \
    npm-debug.log \
    | sed 's/^/    - /'
