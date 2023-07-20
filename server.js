const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000; //Server Port
const { v4: uuidV4 } = require("uuid"); // This Use For Random URL
const ExpressPeerServer = require('peer').ExpressPeerServer;
// var server = PeerServer({port: 9000, path: '/', proxied: true});
app.use('/peerjs', ExpressPeerServer(server, {host: 'localhost', port: 3000, path: '/myapp'}));


app.set("view engine", "ejs");
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

//Web socket
io.on("connection" ,(socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId)
    });

    socket.on("disconnect", (roomId, userId) => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
});

app.use("*", (req, res) => {
    res.status(404).json({
        status: false,
        message: `Page not found ${req.orignalUrl}`
    });
});

//Server
server.listen(port, () => {
    console.log(`Server Running at Port : ${port}`);
});
