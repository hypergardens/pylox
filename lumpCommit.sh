#!/usr/bin/bash

# ready for Github Pages
./loadForPages.sh

# push to main on Github
git add .;
git commit -m "$1";
git push;