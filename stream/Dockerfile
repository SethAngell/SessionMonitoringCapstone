FROM node:17

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
  && apt-get -y install gcc vim ffmpeg libsm6 libxext6 \
  && apt-get clean

COPY ./WebApp /usr/src/app

RUN npm install 
RUN npm run build

ENTRYPOINT npm run dev -- -w -p 8080