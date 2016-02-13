#!/usr/bin/env bash

docker build -t mypictures .

docker save -o mypictures.tar mypictures | bzip2

scp mypictures.tar.bz2 root@vps244493.ovh.net:/docker

#Remote
ssh root@vps244493.ovh.net 'bunzip2 /docker/mypictures.tar.bz2'
ssh root@vps244493.ovh.net 'docker load < /docker/mypictures.tar'
