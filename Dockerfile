FROM node:4-onbuild

ADD crontab /etc/crontab
ADD logcleaning.sh /etc/bin/logcleaning.sh
RUN chmod +x /usr/bin/logcleaning.sh
CMD cron

RUN mkdir /data
RUN mkdir /pictures
RUN mkdir /logs

EXPOSE 8080
