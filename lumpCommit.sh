#!/usr/bin/bash

npm run build

# force copy build to docs
rm -rf docs/*
cp -r dist/* docs/
rm -rf dist/*

# change "/" to "./" for sources in index
sed -i 's/\"\//\"\.\//g' docs/index.html

git add .;
git commit -m "$1";
git push;