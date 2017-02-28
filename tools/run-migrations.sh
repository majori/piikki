#!/bin/bash
# Originally from https://raw.githubusercontent.com/futurice/wappuapp-backend/master/tools/run-migrations-and-seeds.sh
# NOTE: Run this only from project root!

if [[ $NODE_ENV == 'production' ]]
then
    echo -e '\n -- Running migrations!\n'
    DEBUG=knex knex migrate:latest
    echo -e '\n -- End of migrations\n'
else
    echo 'Skipping migrations. NODE_ENV != production'
fi
