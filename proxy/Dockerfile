# Start with Nginx As our base
FROM nginx:latest

RUN apt-get update \
  && apt-get -y install nano

COPY ./nginx/general.nginx.conf /etc/nginx/nginx.conf
#COPY ./nginx/dev/postgres.nginx.conf /etc/nginx/conf.d/
COPY ./nginx/dev/alert.nginx.conf /etc/nginx/conf.d/
COPY ./nginx/dev/chat.nginx.conf /etc/nginx/conf.d/

WORKDIR /usr/share/nginx/html
