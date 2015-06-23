#!/bin/bash

sudo apt-get install python-twisted-web
twistd -no web --path=./videos --port 8000
