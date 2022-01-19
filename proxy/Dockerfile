# Start with Nginx As our base
FROM nginx:latest

RUN apt-get update \
  && apt-get -y install nano

COPY ./nginx/general.nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/dev.nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
