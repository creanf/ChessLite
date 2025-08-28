// INSTALL PRETTIERRC AND ESLINT (if needed?)


const path = require("path");
const express = require("express");
const app = express();
const {createServer} = require("node:http");
const {Server} = require("socket.io");

const server = createServer(app); // http server
const io = new Server(server); // socket.io server

app.use(express.static(__dirname)); // serves files from project dir
app.use(express.urlencoded({ extended: true })); // for parsing post requests

app.get("/", (req,res) => res.sendFile(path.join(__dirname, "index.html"))); // the only file you will need to serve (hopefully)

/*
app.get("", (req, res) => {
    res.send();
});

app.post("", (req, res) => {
    res.send();
});*/

// middleware?

/*
function middleware3(req, res, next) {
  console.log("Middleware 3");
  res.send("Response from Middleware 3");
};

app.use(middleware1);
app.use(middleware2); */

io.on('connection', (socket) => {
  // rooms here
  console.log('User connected');
  /*
  socket.on('', (msg) => {

  });*/
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000; // use .env later
server.listen(PORT, () => {
    console.log("Listening on the port: " + PORT);
});