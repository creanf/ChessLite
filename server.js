const path = require("path");
const express = require("express");
const app = express();
const {createServer} = require("node:http");
const {Server} = require("socket.io");

const server = createServer(app); // http server
const io = new Server(server); // socket.io server

app.use(express.static(__dirname)); // serves files from project dir
app.use(express.urlencoded({ extended: true })); // for parsing post requests
app.use(express.json()); 

const idToName = new Map(); // id to array of players for the id (limited at 2 players)

app.get("/", (req,res) => res.sendFile(path.join(__dirname, "index.html"))); // the only file you will need to serve (hopefully)

app.post("/addPlayer", (req, res) => {
  const playerName = req.body.playerName;
  const id = req.body.id;
  console.log(playerName + id);
  if (idToName.has(id)){
    if (idToName.get(id).length == 1){ // space for one more player
      const response = {joinType: "second player", otherPlayer: idToName.get(id)[0]};
      idToName.get(id).push(playerName);
      res.send(response);
    }
    else { // player may not join
      const response = {joinType: "failed"};
      res.send(response);
    }
  }
  else { // create a new room
    idToName.set(id, [playerName]);
    const response = {joinType: "first player"};
    res.send(response);
  }
})

// when the user enters a name and id, it will check if the id exists and if it is full and post to the id to name map and add their name and id to the game html file
// when they join the game, they will be added to a socketio room with the roomId

io.on('connection', (socket) => {
  // rooms here
  console.log('User connected');

  socket.on('joinRoom', (joinData) => {
    if (joinData.startGame == "true"){
      socket.join(joinData.roomId); // socket = client specific, io = everyone / everyone in room
      console.log(joinData.playerName + " joined room " + joinData.roomId);
      io.to(joinData.roomId).emit("startGame", {playerTwo: joinData.playerName});
    }
    else {
      socket.join(joinData.roomId);
      console.log(joinData.playerName + " joined room " + joinData.roomId);
    }
  });

  socket.on('move', (moveData) => {
    console.log("move from " + moveData.from + " to " + moveData.to + " at " + moveData.roomId);
    socket.to(moveData.roomId).emit("move", {from: moveData.from, to: moveData.to}); // only sent to everyone else in the room (maybe make this io if not working !!!!!!!!!)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000; // use .env later
server.listen(PORT, () => {
    console.log("Listening on the port: " + PORT);
});