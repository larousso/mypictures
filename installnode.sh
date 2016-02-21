#!/usr/bin/env bash

apt-get update && apt-get upgrade

apt-get install curl

apt-get install git

curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

apt-get install --yes nodejs

apt-get install -y build-essential
