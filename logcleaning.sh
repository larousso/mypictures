#!/bin/bash
#
# TPP 2013-02-21
# RJK 2014-08-14
#
# Tomcat apps use a variety of loggers, mostly log4j.
# These rotate, conflicting with logrotate, the unix log rotation system.
#
# Some files eg catalina.out
# are rotated to a backup containing a date eg catalina.2013-01-06.log
# which can then be compressed with bz2 to catalina.2013-01-06.log.bz2
# or removed if older than a given number of days(MTIME).
#
cd /logs
# 2013-02-21
DATE=`date --rfc-3339=date`
YEAR=`date +%Y`
MILLENIUM=20
# 2014-08-14
MTIME=5
echo $MTIME $DATE $YEAR
# 2014-08-14
#for f in $(find catalina* |grep -v bz2 |grep -v '$DATE' |grep $YEAR)
for f in $(find *.log.* |grep -v bz2 |grep -v '$DATE' |grep $MILLENIUM)
do
 # 2014-08-14
 if test `find $f -mtime +$MTIME`
 then
   echo "rm -f $f"
   rm -f $f
 else
    if test `find $f -mtime +1`
    then
        echo "bzip2 $f"
        bzip2 $f
    else
        echo "nothing $f"
    fi
 fi
done
exit 0