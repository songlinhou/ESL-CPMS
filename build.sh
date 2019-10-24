#!/bin/bash
tsc --build tsconfig.json
python postProcessor.py