#!/usr/bin/env bash

echo 'removing old file'
rm mypictures.tar
rm mypictures.tar.bz2

echo 'building docker image'
docker build -t mypictures .

echo 'saving docker image'
docker save -o mypictures.tar mypictures

echo 'compressing docker image'
bzip2 mypictures.tar

echo 'uploading docker image'
scp mypictures.tar.bz2 root@vps244493.ovh.net:/docker


#Remote
echo 'remote decompressing'
ssh rootvps244493.ovh.net 'bunzip2 /docker/mypictures.tar.bz2'
echo 'remote loading'
ssh root@vps244493.ovh.net 'docker load < /docker/mypictures.tar'
echo 'remote running'
ssh root@vps244493.ovh.net 'docker run -d -p 80:8080 -v /app/data:/usr/src/app/data -v /app/logs:/usr/src/app/logs -v /app/pictures:/usr/src/app/pictures mypictures'

docker run -d -p 80:8080 -v /app/src:/usr/src/app mypictures
