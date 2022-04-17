#!/bin/bash

echo "Running http-server..."
gnome-terminal -- /bin/sh -c 'http-server; sleep infinity'
echo "Running node-sass..."
gnome-terminal -- /bin/sh -c 'node-sass --watch static/style/main.scss static/dist/main.css'
