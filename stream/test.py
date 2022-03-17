import argparse
import asyncio
import json
import logging
import os
import ssl

import cv2
from aiohttp import web
import aiohttp_cors
from av import VideoFrame

from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.mediastreams import MediaStreamError
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

clients = set()
listeners = set()
listenerTracks = set()

class TrackMux:
    def __init__(self, track):
        self.listeners = set()
        self.track = track

    def addListener(self, listener):
        self.listeners.add(listener)

    async def run(self):
        asyncio.create_task(self.__run_mux())

    async def __run_mux(self):
        while True:
            frame = await self.track.recv()
            print('Track got frame: ', frame)
            for listener in self.listeners:
                await listener.put(frame)

class ListenerTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.__queue = asyncio.Queue()

    def queue(self):
        return self.__queue

    async def recv(self):
        frame = await self.__queue.get()
        print('Recieved frame: ', frame)
        return frame


async def listener_sdp(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params['sdp'], type='offer')
    print(params)
    pc = RTCPeerConnection()
    print('Number of listeners: ', len(listeners))
    track = ListenerTrack()
    listenerTracks.add(track)
    pc.addTrack(track)
    listeners.add(pc)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    print(answer)
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': 'answer'
        })
    )

async def client_sdp(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params['sdp'], type='offer')

    pc = RTCPeerConnection()
    clients.add(pc)
    print('Number of clients: ', len(clients))
    
    @pc.on('track')
    async def on_track(track):
        tm = TrackMux(track)
        for lt in listenerTracks:
            print('Added track to listener: ', track, lt)
            tm.addListener(lt.queue())
        await tm.run()

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': 'answer'
        })
    )

async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in clients] + [pc.close() for pc in listeners]
    await asyncio.gather(*coros)
    clients.clear()
    listeners.clear()

if __name__ == '__main__':
    app = web.Application()
    app.on_shutdown.append(on_shutdown)

    app.router.add_post('/client', client_sdp)
    app.router.add_post('/listener', listener_sdp)

    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
    })

    for route in list(app.router.routes()):
        cors.add(route)

    web.run_app(app, port='4000')