const moveDetails = {type: "first", id: null, newId: null, gameStarted: false, yourMove: false, selectionMode: "piece" /**or position */};
const playerDetails = {isPlayerOne: false, roomId: ""};

// TO DO: Make more functional
// TO DO: Assign the first player to a random color, then the second to the remaining color
// TO DO: Close game room at end of game

const getPlayerData = () => {
    const firstPlayerName = localStorage.getItem('firstPlayerName');
    const secondPlayerName = localStorage.getItem('secondPlayerName');
    const id = localStorage.getItem('id');
    const isFirst = localStorage.getItem('isFirst');
    return {firstPlayerName, secondPlayerName, id, isFirst};
}

const setPlayerNameView = ({firstPlayerName, secondPlayerName, id, isFirst}) => {
    playerDetails.roomId = id;
    console.log("name 1 - " + firstPlayerName + " name 2 - " + secondPlayerName + " isFirst - " + isFirst);
    document.getElementById('gameId').innerText = "Game ID: " + id;
    document.getElementById("nameFirstPlayer").innerText = "Player 1: " + firstPlayerName;
    document.getElementById("nameSecondPlayer").innerText = "Player 2: " + secondPlayerName;
}

const emitJoinData = (data) => {
    if (!(data.isFirst == 'true')){
        //flip the board
        flipBoard();
        const joinInfo = {
            playerName: data.secondPlayerName,
            roomId: data.id,
            startGame: "true",
        }
        socket.emit("joinRoom", joinInfo);
    }
    else{
        //emit name, room id, and if we want the game to start (not yet)
        const joinInfo = {
            playerName: data.firstPlayerName,
            roomId: data.id,
            startGame: "false",
        }
        playerDetails.isPlayerOne = true;
        socket.emit("joinRoom", joinInfo);
    }
}

const getAndEmitPlayerData = () => {
    const data = getPlayerData();
    setPlayerNameView(data);
    emitJoinData(data);
    makeClickEvents();
}

const parseMoveData = (moveData) => {
    const fromId = moveData.from;
    const toId = moveData.to;
    moveDetails.yourMove = true;
    const newPosition = document.getElementById(toId);
    const position = document.getElementById(fromId);
    return {newPosition, position};
}

const movePiece = (position, newPosition) => {
    const img = position.querySelector("img");
    const pieceImage = img.getAttribute("src");
    const piece = img.getAttribute("name");
    const style = img.getAttribute("style");
    img.src = "";
    img.name = "";
    img.style = ""
    const newImg = newPosition.querySelector("img");
    newImg.src = pieceImage;    
    newImg.name = piece;
    newImg.style = style;
}

const flipBoard = function() {
    //const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    // first copy all existing elements into an so we have copies to reference
    const boardGrid = document.getElementById("boardGrid");
    const squaresArray = Array.from(boardGrid.querySelectorAll("div")); // (static, this won't be updated in the for loop, so we can treat it as a copy)
    boardGrid.innerHTML = "";
    // then add the new elements in order
    for (let i = 7; i > -1; i--){
        for (let j = 7; j > -1 ; j--){
            //const currLetter = letters[j];
            const arrayNumber = i * 8 + j;
            const piece = squaresArray[arrayNumber]
            //piece.id = String(currLetter + i);
            boardGrid.appendChild(piece);
        }
    }
}

const makeClickEvents = function(){
    const posLetters = ['a','b','c','d','e','f','g','h'];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const id = `${posLetters[j]}${i + 1}`;
            const position = document.getElementById(id);
            position.addEventListener('click', function() {
                const evt = new CustomEvent("move", { detail: { at: id}});
                document.dispatchEvent(evt);
            });
        } 
    }
}

const secondClick = function(newId, id) {
    const newPosition = document.getElementById(newId);
    const position = document.getElementById(id);
    movePiece(position, newPosition);
}

window.addEventListener('DOMContentLoaded', getAndEmitPlayerData);

socket.on("startGame", (newPlayer) => {
    console.log("starting game");
    moveDetails.gameStarted = true;
    const playerTwoName = newPlayer.playerTwo;
    document.getElementById("nameSecondPlayer").innerText = "Player 2: " + playerTwoName;
    if (playerDetails.isPlayerOne){
        moveDetails.yourMove = true;
    }
});

document.addEventListener("move", (e) => {
    const { at } = e.detail;
    if (moveDetails.type == "first" && moveDetails.gameStarted && moveDetails.yourMove){
        moveDetails.id = at;
        moveDetails.type = "second";
    }
    else if (moveDetails.type == "second"){
        moveDetails.newId = at;
        moveDetails.type = "first";
        moveDetails.yourMove = false;
        socket.emit("move", {from: moveDetails.id,to: moveDetails.newId,roomId: playerDetails.roomId});
        secondClick(moveDetails.newId, moveDetails.id);
    }
});

socket.on("move", (moveData) => {  // recieved when the other player makes a move
    console.log("move seen")
    const {newPosition, position} = parseMoveData(moveData);
    movePiece(position, newPosition);
})