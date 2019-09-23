#!/bin/bash
pm2 reload --silent --update-env alumni-hukum-unair_api
sleep 5
pm2 reload --silent --update-env alumni-hukum-unair_web