# deploy the database backend
(cd store && docker-compose up -d)

DB_LIVE=false
TIMEOUT=0

while [ "$DB_LIVE" = "false" ] && [ "$TIMEOUT" -lt 10 ]
do
    if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
        DB_LIVE=true
        echo 'The database is live'
    else
        echo 'Waiting'
        TIMEOUT=$TIMEOUT + 1
        sleep 1.0
    fi
done

if [[ $TIMEOUT -gt 9 ]] ; then
    echo 'The database failed to deploy'
fi

ADMIN_LIVE=false
TIMEOUT=0

while [ "$ADMIN_LIVE" = "false" ] && [ "$TIMEOUT" -lt 10 ]
do
    if lsof -Pi :5050 -sTCP:LISTEN -t >/dev/null ; then
        ADMIN_LIVE=true
        echo 'The database admin panel is live'
    else
        echo 'Waiting'
        TIMEOUT=$TIMEOUT + 1
        sleep 1.0
    fi
done

if [[ $TIMEOUT -gt 9 ]] ; then
    echo 'The database admin panel failed to deploy'
fi

# Bring up proxy
docker-compose up -d

PROXY_LIVE=false
TIMEOUT=0

while [ "$PROXY_LIVE" = "false" ] && [ "$TIMEOUT" -lt 10 ]
do
    if curl -s 'http://localhost/pgadmin' > /dev/null ; then
        PROXY_LIVE=true
        echo 'The reverse proxy is live'
    else
        echo 'Waiting on reverse proxy'
        TIMEOUT=$(($TIMEOUT + 1))
        sleep 1.0
    fi
done

if [[ $TIMEOUT -gt 9 ]] ; then
    echo 'Reverse proxy failed to deploy'
fi