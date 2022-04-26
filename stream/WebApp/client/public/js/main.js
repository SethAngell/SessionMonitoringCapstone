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
let auth_header = null;
let chat_endpoint = null;
var socket;


on_start();

function on_start() {
  container = document.getElementById("content-container");
  api_key_field = document.getElementById("api-key");

  var current_url = window.location.href;

  // https://stackoverflow.com/a/5582621
  let dev_hosts = ["localhost", "stream.capstone.com"];
  if (dev_hosts.some((v) => current_url.includes(v))) {
    dev = true;
  } else {
    dev = false;
  }

  if (dev) {
    session_room_url = "http://auth.capstone.com/api/v1/auth/get-session-room/";
    health_check_url = "http://auth.capstone.com/api/v1/auth/ping/";
    chat_endpoint = "http://alert.capstone.com";
  } else {
    session_room_url =
      "http://auth.capstone.doublel.studio/api/v1/auth/get-session-room/";
    health_check_url = "http://auth.capstone.doublel.studio/api/v1/auth/ping/";
    chat_endpoint = "http://alert.capstone.doublel.studio";
  }
}

function get_api_key() {
  api_key = api_key_field.value;
  auth_header = `Api-Key ${api_key}`;
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
    retrieve_session_id().then((data) => {
      console.log(data);
      let obj = JSON.parse(data);
      console.log(obj);
      session_room_name = obj.RoomName;
      session_id = obj.SessionID;
      container.innerHTML = "";
      console.log(`API Key After container nuke: ${api_key}`);

      spawn_chatbox(container, session_room_name);
      after_login();
    });
  } else {
    alert("Make sure you enter an API key!");
  }
}

async function retrieve_session_id() {
  const response = await fetch(session_room_url, {
    method: "GET",
    headers: {
      Authorization: auth_header,
    },
  });

  return response.json();
}

async function StartHealthCheckProcess() {
  let payload = {
    SessionID: session_id,
  };

  let str_payload = JSON.stringify(payload);
  console.log(payload);
  console.log(str_payload);

  const response = await fetch(health_check_url, {
    method: "POST",
    headers: {
      Authorization: auth_header,
      "Content-Type": "application/json",
    },
    body: str_payload,
  });
  response.json().then((data) => {
    console.log(data);
  });
  setTimeout(StartHealthCheckProcess, 50000);
}

window.attempt_login = attempt_login;

function after_login() {
  setup();
  StartHealthCheckProcess();
  add_on_enter_send_listener();
  open_socket("Viewer", session_room_name);
}

let playButton;
let receiver;
let useWebSocket;

window.document.oncontextmenu = function () {
  return false; // cancel default menu
};

window.addEventListener(
  "resize",
  function () {
    receiver.resizeVideo();
  },
  true
);

window.addEventListener(
  "beforeunload",
  async () => {
    await receiver.stop();
  },
  true
);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML =
      "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById("playButton")) {
    let elementPlayButton = document.createElement("img");
    elementPlayButton.id = "playButton";
    elementPlayButton.src = "images/Play.png";
    elementPlayButton.alt = "Start Streaming";
    playButton = document
      .getElementById("player")
      .appendChild(elementPlayButton);
    playButton.addEventListener("click", onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = "none";

  const playerDiv = document.getElementById("player");

  // add video player
  const elementVideo = document.createElement("video");
  elementVideo.id = "Video";
  elementVideo.style.touchAction = "none";
  playerDiv.appendChild(elementVideo);

  setupVideoPlayer(elementVideo).then((value) => (receiver = value));

  // add fullscreen button
  const elementFullscreenButton = document.createElement("img");
  elementFullscreenButton.id = "fullscreenButton";
  elementFullscreenButton.src = "images/FullScreen.png";
  playerDiv.appendChild(elementFullscreenButton);
  elementFullscreenButton.addEventListener("click", function () {
    if (!document.fullscreenElement || !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      } else {
        if (playerDiv.style.position == "absolute") {
          playerDiv.style.position = "relative";
        } else {
          playerDiv.style.position = "absolute";
        }
      }
    }
  });
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("fullscreenchange", onFullscreenChange);

  function onFullscreenChange() {
    if (document.webkitFullscreenElement || document.fullscreenElement) {
      playerDiv.style.position = "absolute";
      elementFullscreenButton.style.display = "none";
    } else {
      playerDiv.style.position = "relative";
      elementFullscreenButton.style.display = "block";
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
  const playerDiv = document.getElementById("player");
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
  `;
  container.innerHTML = video_player_html;
}

// Socket.IO Stuff
function open_socket(_name, _room) {

  if (window.location.href.includes('doublel')) {
      socket = io.connect("http://alert.capstone.doublel.studio")
  } else {
      socket = io.connect('http://alert.capstone.com');
  }
  
  socket.on('connect', function() {
      socket.emit('joined', {
          name: _name,
          room: _room,
      });
  });
}

function add_on_enter_send_listener() {
  document.getElementById("chat-input-box")
  .addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.key === 'Enter') {
      document.getElementById("send-button").click();
  }
});
}

function send_message() {
  let message_input = document.getElementById("chat-input-box");
  console.log(message_input.value);
  socket.emit('text', {msg: message_input.value, name: "Viewer"})
  message_input.value = ""
}
window.send_message = send_message;

window.addEventListener('beforeunload', function (e) {
  if (left != true) {
      leave_room();
  }
  
});