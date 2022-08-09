#!/usr/bin/bash

npm run build

# force copy build to docs
cp -r dist/* docs/
rm -rf dist/*

# change "/" to "./" for sources in index
sed -i 's/\"\//\"\.\//g' docs/index.html