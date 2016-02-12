FROM node:4-onbuild

RUN apt-get update && apt-get install cron -y

ADD crontab /etc/cron.d/
ADD logcleaning.sh /usr/bin/logcleaning.sh
RUN chmod +x /usr/bin/logcleaning.sh
RUN ls /etc/init.d/
CMD /etc/init.d/cron restart

RUN mkdir /data
RUN mkdir /pictures
RUN mkdir /logs

EXPOSE 8080
