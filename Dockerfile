FROM node:4-onbuild


RUN mkdir -p /usr/src/app/data
RUN mkdir -p /usr/src/app/pictures
RUN mkdir -p /usr/src/app/logs

EXPOSE 8080
