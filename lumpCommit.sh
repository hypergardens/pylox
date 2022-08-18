#!/usr/bin/bash

npm run build

./loadForPages.sh

git add .;
git commit -m "$1";
git push;