const express = require('express')
const app = express()
const http = require("http")
const { Server } = require("socket.io")

// CORS middleware
const cors = require('cors')
app.use(cors({
    origin: "http://localhost:5173/courses"
}))

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
})

io.on('connection', (socket) => {
    // console.log('A user connected: ' + socket.id);

    // Message event
    socket.on('newReview', (data) => {
        console.log('(SERVER) New review: ' + data.review);
        socket.broadcast.emit('newReviewAlert', data);
    })



    // Disconnect event
    socket.on('disconnect', () => {
        // console.log('A user disconnected: ' + socket.id);
    })
})

server.listen(3000, () => {
    console.log('listening on port:3000');
})