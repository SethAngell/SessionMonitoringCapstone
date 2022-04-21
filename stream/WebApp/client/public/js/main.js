import { Receiver } from "./receiver.js";
import { getServerConfig } from "../../js/config.js";

//setup();
let container = null;
let api_key_field = null;
let api_key = null;
let session_room_name = null;
let session_id = null;
let dev = null;
let session_room_url = null;
let health_check_url = null;


on_start();

function on_start() {
  container = document.getElementById("content-container");
  api_key_field = document.getElementById("api-key");

  var current_url = window.location.href;

  // https://stackoverflow.com/a/5582621
  let dev_hosts = ["localhost", "stream.capstone.com"];
  if (dev_hosts.some(v => current_url.includes(v))) {
    dev = true;
  }
  else {
    dev = false;
  }

  if (dev) {
    let session_room_url = 'http://auth.capstone.com/api/v1/auth/get-session-room/';
    let health_check_url = 'http://auth.capstone.com/api/v1/auth/ping/';
  }
  else {
    let session_room_url = 'http://auth.capstone.doublel.studio/api/v1/auth/get-session-room/';
    let health_check_url = 'http://auth.capstone.doublel.studio/api/v1/auth/ping/';
  }

}

function get_api_key() {
  api_key = api_key_field.value;
  console.log(api_key);
}

function check_api_key() {
  get_api_key();

  if (api_key === "") {
    return false;
  } else {
    return true;
  }
}

function attempt_login() {
  if (check_api_key()) {
    retrieve_session_id()
      .then(data => {
        console.log(data);
        session_room_name = data["RoomName"];
        session_id = data["SessionID"];
      });
    container.innerHTML = '';
    console.log(`API Key After container nuke: ${api_key}`);
    
    spawn_chatbox(container, session_room_name);
    after_login();
  } else {
    alert("Make sure you enter an API key!");
  }
}



async function retrieve_session_id() {
  const response = await fetch(session_room_url, {
    method: 'GET',
    headers: {
      'Authorization': `Api-Key ${api_key}`
    },
  });
  return response.json()
}

async function start_health_check(interval) {
  const response = await fetch(health_check_url, {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${api_key}`
    },
    body: JSON.stringify({"SessionID": session_id}),
  });
  return response.json()
}

window.attempt_login = attempt_login;

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

function spawn_chatbox(container, room) { 
  var video_player_html = `
  <div id="container" class="container-fluid d-flex justify-content-center">
    <div id="display-card" class="card w-50">
      <div class="card-header">
        Current Session
      </div>
      <div class="card-body">
        
        <h5 class="card-title">Room ID: ${room}</h5>

        <div id="warning" hidden=true></div>

        <div id="player"></div>
        
        <div id="chat-input" class="input-group mb-3 mt-3">
          <input type="text" class="form-control" id="chat-input-box" placeholder="New Message" aria-label="Recipient's username" aria-describedby="from-label">
          <button class="btn btn-outline-success" type="button" id="send-button" onclick="send_message()">Send Alert</button>
        </div>
      
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
