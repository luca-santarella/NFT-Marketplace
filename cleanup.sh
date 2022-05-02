#!/bin/sh
rm -v -rf NFTs/*
rm -v -rf db/popnft.db
find images/ -maxdepth 1 -type f -delete #keep only the assets folder
echo 'deleted all images'
