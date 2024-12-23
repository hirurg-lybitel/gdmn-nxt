#!/bin/bash

docker compose -f docker-compose.run.yml --env-file .env up -d
