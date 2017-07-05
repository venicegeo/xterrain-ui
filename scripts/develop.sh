#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


DEFAULT_PORT=3000


webpack-dev-server \
    --inline \
    --hot \
    --colors \
    $([[ "$*" =~ "--port" ]] || echo "--port $DEFAULT_PORT") \
    "$@"
