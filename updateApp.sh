#!/bin/bash
git checkout .
git pull
yarn
yarn run build
./restartApp.sh