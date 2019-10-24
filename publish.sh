#!/bin/bash
if [ -n "$1" ]; then
    tsc --build tsconfig.json
    python postProcessor.py
    git add .
    git commit -m "$1"
    git push origin master
else
    echo 'message not provided'
fi