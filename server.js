const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000; //Server Port
const { v4: uuidV4 } = require("uuid"); // This Use For Random URL
const ExpressPeerServer = require('peer').ExpressPeerServer;
// var server = PeerServer({port: 9000, path: '/', proxied: true});
app.use('/peerjs', ExpressPeerServer(server, {port: 9000, path: '/', proxied: true}));


app.set("view engine", "ejs");
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

//web socket
io.on("connection" ,(socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId)
    });

    socket.on("disconnect", (roomId, userId) => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
});

//Server
server.listen(port, () => {
    console.log(`Server Running at Port : ${port}`);
});