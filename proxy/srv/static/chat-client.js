var socket;
var credentials = {
    name: null,
    room_id: null,
}
var left = false;



function leave_room() {
    socket.emit('left', {name: credentials.name}, function() {
        socket.disconnect();
    });
}

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

function set_status_and_message_listeners() {
    let chat_window = document.getElementById('chat-window');
    socket.on('status', function(data) {
        if (data.state === "joined") {
            chat_window.value = chat_window.value + '<' + data.name.toUpperCase() + ' joined the room! ' + '>\n';
        } else if (data.state === "left") {
            chat_window.value = chat_window.value + '<' + data.name.toUpperCase() + ' left the room :( ' + '>\n';
        } else {
            chat_window.value = chat_window.value + '<' + data.name.toUpperCase() + ' is being suspicious 🤔' + '>\n';
        }
        chat_window.scrollTop = chat_window.scrollHeight;
    });
    
    socket.on('message', function(data) {
        chat_window.value = chat_window.value + data.name.toUpperCase() + ': ' + data.msg + '\n';
        chat_window.scrollTop = chat_window.scrollHeight
    });
}

function spawn_chatbox(container, name, room) { 
    var chat_box_html = `
        <div id="chat-card" class="card w-75">
            <div class="card-header">
                Room: ${room}
            </div>
            <div class="card-body">
                <h5 class="card-title">Get talking!</h5>
                <div class="input-group mb-3">
                    <textarea class="form-control" id="chat-window" rows="10" readonly></textarea>
                </div>
                <div id="chat-input" class="input-group mb-3">
                    <span class="input-group-text" id="from-label">${name}</span>
                    <input type="text" class="form-control" id="chat-input-box" placeholder="New Message" aria-label="Recipient's username" aria-describedby="from-label">
                    <button class="btn btn-outline-success" type="button" id="send-button" onclick="send_message()">Send</button>
                </div>
            </div>
        </div>
    `
    container.innerHTML = chat_box_html
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

function join_session() {
    let name_input = document.getElementById("name");
    let room_input = document.getElementById("room-id");
    let login_card = document.getElementById("login-card");
    let container = document.getElementById("top-level-chat-container");
    let restart_button = document.getElementById("restart_button")

    credentials.name = name_input.value;
    credentials.room_id = room_input.value;

    name_input.disabled = true;
    room_input.disabled = true;

    login_card.remove()
    open_socket(credentials.name, credentials.room_id)
    spawn_chatbox(container, credentials.name, credentials.room_id)
    add_on_enter_send_listener()
    set_status_and_message_listeners()
    restart_button.classList.remove("d-none")

    
}

function send_message() {
    let message_input = document.getElementById("chat-input-box");
    console.log(message_input.value);
    socket.emit('text', {msg: message_input.value, name: credentials.name})
    message_input.value = ""
}

window.addEventListener('beforeunload', function (e) {
    if (left != true) {
        leave_room();
    }
    
});

function restart() {
    leave_room()
    left = true;
    location.reload();
}
