#!/bin/bash -e

cd $(dirname $(dirname $0))  # Return to project root
################################################################################


MINIMUM_NODE_VERSION=7


if [ ! -d node_modules ]; then
    echo -e "It looks like your development environment is not properly set up.\n"
    read -p "Would you like to set it up now (y/N)? " -r

    if [[ ! "$REPLY" =~ ^[Yy] ]]; then
        echo -e "\nExiting...\n"
        exit 1
    fi

    echo
    printf '=%.0s' {1..80}
    echo

    ############################################################################

    echo -e "\nInstalling Node dependencies\n"

    if ! node -e "assert(process.version.slice(1).split('.')[0] >= $MINIMUM_NODE_VERSION)" 2>/dev/null; then
        echo -e "\nNode 7.0.0 or higher must be installed first"
        exit 1
    fi

    npm install

    ############################################################################

    echo
    printf '=%.0s' {1..80}
    echo

    ############################################################################
fi

export PATH="$(pwd)/node_modules/.bin:$PATH"
