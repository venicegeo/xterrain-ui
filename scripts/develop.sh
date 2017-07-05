#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


DEFAULT_PORT=3000


./temporary_mock_xterrain_api/server.py --port 3001 &
trap 'pkill -SIGTERM -f temporary_mock_xterrain_api/server.py' EXIT


webpack-dev-server \
    --inline \
    --hot \
    --colors \
    $([[ "$*" =~ "--port" ]] || echo "--port $DEFAULT_PORT") \
    "$@"
