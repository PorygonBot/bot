#!/bin/sh
set -x
tsc --build && node . --enable-source-map
