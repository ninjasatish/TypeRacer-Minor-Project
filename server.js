const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

let users = []
let ranklist = []

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendParagraph', (data) => {
        io.emit('receiveParagraph', data); // Broadcast to all clients
    });

    socket.on('joinRace', (newName) => {
        users.push(newName)
    
        console.log(`Currently these users are active : ${users}`)
    });

    socket.on('complete', (details)=>{
        console.log(details['name'], details['speed'])
        ranklist.push(details)
        
        ranklist.sort((a, b) => b['speed'] - a['speed'])
        console.log(ranklist);

        io.emit('scores', ranklist);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/client', (req, res) => {
    res.redirect('/client-intro.html');
});
app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
