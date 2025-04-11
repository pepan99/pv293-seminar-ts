#!/bin/bash

CURR_DIR=$(dirname -- $(readlink -fn -- "$0"))


ENV_FILE="$CURR_DIR/.env"
OUTPUT_FILE="$CURR_DIR/core/types/db.d.ts"

pnpm kysely-codegen --camel-case --out-file "$OUTPUT_FILE" --env-file "$ENV_FILE"
