#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


tslint -t stylish '{src,test}/**/*.{ts,tsx}' "$@"
