#!/usr/bin/bash

cp -r dist/* docs/
# rm -rf dist/*
sed -i 's/\"\//\"\.\//g' docs/index.html