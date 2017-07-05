#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


rm -rf dist

echo -e "Compiling into 'dist'...\n"
webpack --colors --progress --hide-modules "$@"
