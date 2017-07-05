#!/bin/bash -e

. $(dirname $0)/_check_environment.sh
################################################################################


echo "Running linter..."
./scripts/lint.sh


# echo -e "\nRunning unit tests...\n"
# jest "$@"
