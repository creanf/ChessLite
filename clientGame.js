const moveDetails = {type: "first", id: null, newId: null, gameStarted: false, yourMove: false, piece: "", takenPiece: "", selectionMode: "piece" /**or position */};
const playerDetails = {isPlayerOne: false, roomId: ""};
const takenPieces = {};
const board = [ ["wR","wN","wB","wQ","wK","wB","wN","wR"],["wP","wP","wP","wP","wP","wP","wP","wP"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["bP","bP","bP","bP","bP","bP","bP","bP"],["bR","bN","bB","bQ","bK","bB","bN","bR"] ]; // the html selection stuff is unnecessary if this works
const letterConvert = {"a":0, "b":1, "c":2, "d":3, "e":4, "f":5, "g":6, "h":7};

// TO DO: Assign the first player to a random color, then the second to the remaining color
// TO DO: Close game room at end of game
// TO DO: Use moveOnArray and isValidMove in main move event listener, print the board to check if working
// TO DO: Queening

// TO DO NEXT: Check if the pawn move function works

const printBoard = () => {
    for (let i = 7; i >= 0; --i) {
        let rowString = ""
        for (let j = 0; j < 8; ++j) {
            rowString += board[i][j] + " ";
        }
        console.log(rowString);
    }
}

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

const movePieceOnArray = (position, newPosition) => { //////////TO DO

    const currPos = {row: parseInt(position[1])-1, col: letterConvert[position[0]]};
    const destPos = {row: parseInt(newPosition[1])-1, col: letterConvert[newPosition[0]]};

    const currPiece = board[currPos.row][currPos.col];
    const destPiece = board[destPos.row][destPos.col];

    // add to taken pieces here

    board[currPos.row][currPos.col] = "__";
    board[destPos.row][destPos.col] = currPiece;

    console.log("curr piece: " + currPiece + " dest piece: " + destPiece + " currRow: " + currPos.row + " currCol: " + currPos.col + " destRow: " + destPos.row + " destCol: " + destPos.col);

    printBoard();
}

// @returns bool which is true if the move is value
const isValidMove = (moveDetails) => { //////////////TO DO
    const {piece, newPiece} = moveDetails;
    if (piece[1] == "P" && checkPawnMove(moveDetails)){
        return true;
    }
    
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

const secondClick = function(id, newId) {
    const newPosition = document.getElementById(newId);
    const position = document.getElementById(id);
    movePieceOnArray(moveDetails.id, moveDetails.newId) ////////////////This and socket move could be the same function if we just used io
    movePiece(position, newPosition);
}

window.addEventListener('DOMContentLoaded', getAndEmitPlayerData);

socket.on("startGame", (newPlayer) => {
    printBoard();
    console.log("starting game");
    moveDetails.gameStarted = true;
    const playerTwoName = newPlayer.playerTwo;
    document.getElementById("nameSecondPlayer").innerText = "Player 2: " + playerTwoName;
    if (playerDetails.isPlayerOne){
        moveDetails.yourMove = true;
    }
});

document.addEventListener("move", (e) => {
    const { at } = e.detail; //coordinates drom the move event
    if (moveDetails.type == "first" && moveDetails.gameStarted && moveDetails.yourMove){
        moveDetails.id = at;
        moveDetails.type = "second";
        const pieceElement = document.getElementById(at);
        moveDetails.piece = pieceElement.querySelector('img').name;
    }
    else if (moveDetails.type == "second"){
        // function here called check if valid or (or something)
        // if the move is not valid, reset the move data            ////////////////////
        moveDetails.newId = at;
        moveDetails.type = "first";
        moveDetails.yourMove = false;
        socket.emit("move", {from: moveDetails.id,to: moveDetails.newId,roomId: playerDetails.roomId});
        secondClick(moveDetails.id, moveDetails.newId);
    }
});

socket.on("move", (moveData) => {  // recieved when the other player makes a move
    console.log("move seen")
    const {newPosition, position} = parseMoveData(moveData); // this gives html element data not actual coordinates
    movePieceOnArray(moveData.from, moveData.to);
    movePiece(position, newPosition);
})

const checkPawnMove = (moveData) => {
    const {id, newId} = moveData;
    const currRow = id[1]-1;
    const currCol = letterConvert[id[0]];
    const newRow = newId[1] - 1;
    const newCol = letterConvert[newId[0]];
    if (moveData.piece[0] == "w") {
        // white pawns always move from a higher row number to a lower row number, and only change columns when taking a piece
        // NOTE: they can be turned into any other piece once they reach the end of the board, but this can be dealt with later
        // NOTE: the player actually cannot move out of bounds, so we do not need to check for this

        // make sure to check if a capture is allowed
        if (newRow == currRow + 1) {
            if (newCol == currCol + 1 && board[newRow][newCol][0] == "b"){
                return true;
            }
            else if (newCol == currCol - 1 && board[newRow][newCol][0] == "b"){
                return true;
            }
            else if (newCol == currCol && board[newRow][newCol] == "__"){
                if (newRow == 7){
                    // queen function here ///////////////
                }
                return true;
            }
            else {
                return false;
            }
        }
        else if (newRow == currRow + 2) {
            if (currRow != 2) {
                return false;
            }
            else if (newCol != currCol){
                return false;
            }
            else if (board[newRow][newCol] != "__") {
                return false;
            }
            else {
                return true;
            }
        }
    }
    else if (moveData.piece[0] == "b"){
        if (newRow == currRow - 1) {
            if (newCol == currCol + 1 && board[newRow][newCol][0] == "b"){
                return true;
            }
            else if (newCol == currCol - 1 && board[newRow][newCol][0] == "b"){
                return true;
            }
            else if (newCol == currCol && board[newRow][newCol] == "__"){
                if (newRow == 0){
                    // queen function here ///////////////
                }
                return true;
            }
            else {
                return false;
            }
        }
        else if (newRow == currRow - 2) {
            if (currRow != 7) {
                return false;
            }
            else if (newCol != currCol){
                return false;
            }
            else if (board[newRow][newCol] != "__") {
                return false;
            }
            else {
                return true;
            }
        }
    }
    else {
        return false;
    }
}

const checkRookMove = (moveData) => {
    if (moveData.piece[0] == "w") {

    }
    else {
        
    }
}

const checkKnightMove = (moveData) => {
    if (moveData.piece[0] == "w") {

    }
    else {
        
    }
}

const checkBishopMove = (moveData) => {
    if (moveData.piece[0] == "w") {

    }
    else {
        
    }
}

const checkKingMove = (moveData) => {
    if (moveData.piece[0] == "w") {

    }
    else {
        
    }
}

const checkQueenMove = (moveData) => {
    if (moveData.piece[0] == "w") {

    }
    else {
        
    }
}