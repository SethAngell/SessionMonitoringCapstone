import { Receiver } from "./receiver.js";
import { getServerConfig } from "../../js/config.js";

//setup();
let container = null;
let api_key_field = null;
let api_key = null;

on_start();

function on_start() {
  container = document.getElementById("content-container");
  api_key_field = document.getElementById("api-key")
}

function get_api_key() {
  api_key = api_key_field.value;
  console.log(api_key);
}

function check_api_key() {
  get_api_key();

  if (api_key === null) {
    return false;
  } else {
    return true;
  }
}

function attempt_login() {
  if (check_api_key()) {
    container.innerHTML = '';
    console.log(`API Key After container nuke: ${api_key}`);
    spawn_chatbox();
    after_login();
  } else {
    alert("Make sure you enter an API key!");
  }
}

function after_login() {
  setup();
}

let playButton;
let receiver;
let useWebSocket;

window.document.oncontextmenu = function () {
  return false;     // cancel default menu
};

window.addEventListener('resize', function () {
  receiver.resizeVideo();
}, true);

window.addEventListener('beforeunload', async () => {
  await receiver.stop();
}, true);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML = "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById('playButton')) {
    let elementPlayButton = document.createElement('img');
    elementPlayButton.id = 'playButton';
    elementPlayButton.src = 'images/Play.png';
    elementPlayButton.alt = 'Start Streaming';
    playButton = document.getElementById('player').appendChild(elementPlayButton);
    playButton.addEventListener('click', onClickPlayButton);
  }
}

function onClickPlayButton() {

  playButton.style.display = 'none';

  const playerDiv = document.getElementById('player');

  // add video player
  const elementVideo = document.createElement('video');
  elementVideo.id = 'Video';
  elementVideo.style.touchAction = 'none';
  playerDiv.appendChild(elementVideo);

  setupVideoPlayer(elementVideo).then(value => receiver = value);

  // add fullscreen button
  const elementFullscreenButton = document.createElement('img');
  elementFullscreenButton.id = 'fullscreenButton';
  elementFullscreenButton.src = 'images/FullScreen.png';
  playerDiv.appendChild(elementFullscreenButton);
  elementFullscreenButton.addEventListener("click", function () {
    if (!document.fullscreenElement || !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else {
        if (playerDiv.style.position == "absolute") {
          playerDiv.style.position = "relative";
        } else {
          playerDiv.style.position = "absolute";
        }
      }
    }
  });
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  document.addEventListener('fullscreenchange', onFullscreenChange);

  function onFullscreenChange() {
    if (document.webkitFullscreenElement || document.fullscreenElement) {
      playerDiv.style.position = "absolute";
      elementFullscreenButton.style.display = 'none';
    }
    else {
      playerDiv.style.position = "relative";
      elementFullscreenButton.style.display = 'block';
    }
  }
}

async function setupVideoPlayer(elements) {
  const videoPlayer = new Receiver(elements);
  await videoPlayer.setupConnection(useWebSocket);

  videoPlayer.ondisconnect = onDisconnect;

  return videoPlayer;
}

function onDisconnect() {
  const playerDiv = document.getElementById('player');
  clearChildren(playerDiv);
  receiver.stop();
  receiver = null;
  showPlayButton();
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function spawn_chatbox(container, name, room) { 
  var video_player_html = `
  <div id="container" class="container-fluid d-flex justify-content-center">
    <div id="display-card" class="card w-50">
      <div class="card-header">
        Current Session
      </div>
      <div class="card-body">
        
        <h5 class="card-title">Current Session: </h5>

        <div id="warning" hidden=true></div>

        <div id="player"></div>
      
      </div>
      <div class="card-footer text-muted">
        Based on source code from <a href="https://github.com/Unity-Technologies/UnityRenderStreaming">Unity-Technologies</a>. 
        Modified in compliance with the <a href="https://unity3d.com/legal/licenses/Unity_Companion_License">Unity Companion License</a>        
      </div>
    </div>
  </div>
  `
  container.innerHTML = video_player_html;
}

function login() {
  alert("Atta Boy! You logged in!");
}