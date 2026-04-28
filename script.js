let socket;
let myPlayer;
let otherPlayers = {};
let name, room;

function setup() {
    createCanvas(windowWidth, windowHeight);
    name = prompt("اكتب اسمك:");
    room = prompt("كود الروم:");
    
    socket = io();

    // الانضمام للروم
    socket.emit('joinRoom', { name, room });

    // استقبال بيانات اللاعبين
    socket.on('updatePlayers', (serverPlayers) => {
        for (let id in serverPlayers) {
            if (serverPlayers[id].room === room) {
                otherPlayers[id] = serverPlayers[id];
            }
        }
    });

    socket.on('playerMoved', (data) => {
        if (data.room === room) {
            otherPlayers[data.id] = data;
        }
    });

    socket.on('playerDisconnected', (id) => {
        delete otherPlayers[id];
    });
}

function draw() {
    background(210, 180, 140);
    
    let me = otherPlayers[socket.id];
    if (!me) return;

    // كاميرا تتبع اللاعب
    translate(width/2 - me.x, height/2 - me.y);

    // رسم اللاعبين
    for (let id in otherPlayers) {
        let p = otherPlayers[id];
        push();
        translate(p.x, p.y);
        rotate(p.angle);
        fill(id === socket.id ? "green" : "red");
        ellipse(0, 0, 40);
        pop();
        fill(0); text(p.name, p.x - 10, p.y - 30);
    }

    // التحكم
    let moved = false;
    if (keyIsDown(LEFT_ARROW)) { me.x -= 5; moved = true; }
    if (keyIsDown(RIGHT_ARROW)) { me.x += 5; moved = true; }
    if (keyIsDown(UP_ARROW)) { me.y -= 5; moved = true; }
    if (keyIsDown(DOWN_ARROW)) { me.y += 5; moved = true; }
    
    me.angle = atan2(mouseY - height/2, mouseX - width/2);

    if (moved) {
        socket.emit('move', { x: me.x, y: me.y, angle: me.angle });
    }
}
