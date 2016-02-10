FROM node:4-onbuild

RUN mkdir /data

RUN mkdir /pictures

RUN mkdir /logs

EXPOSE 8080
