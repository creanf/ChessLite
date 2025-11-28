const moveDetails = {type: "first", id: null, newId: null, gameStarted: false, yourMove: false, pieceBoardCoords: null, pieceName: "", selectionMode: "piece"};
const playerDetails = {isPlayerOne: false, roomId: ""};
const takenPieces = {};
// FIXME: board and boardGrid variable names are confusing
// FIXME: player names not swapping - make this a part of the "flipBoard" function
const board = [ ["wR","wN","wB","wQ","wK","wB","wN","wR"],["wP","wP","wP","wP","wP","wP","wP","wP"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["__","__","__","__","__","__","__","__"],["bP","bP","bP","bP","bP","bP","bP","bP"],["bR","bN","bB","bQ","bK","bB","bN","bR"] ]; // the html selection stuff is unnecessary if this works
const letterConvert = {"a":0, "b":1, "c":2, "d":3, "e":4, "f":5, "g":6, "h":7};

// TO DO: Assign the first player to a random color, then the second to the remaining color
// TO DO: Close game room at end of game
// TO DO: Use moveOnArray and isValidMove in main move event listener, print the board to check if working
// TO DO: Queening
// TO DO: Fix vscode config

// TO DO NEXT: Check if the pawn move function works

// position = position in html, while id = actual coordinates
const convertToRowCol = (id) => {
    return {row: parseInt(id[1])-1, col: letterConvert[id[0]]};
}

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
        //emit name, room id, and if we want the game to start (in this case, we don't)
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

const movePieceOnArray = (id, newId) => { //TO DO

    const currPos = convertToRowCol(id)
    const destPos = convertToRowCol(newId)

    const currPiece = board[currPos.row][currPos.col];
    const destPiece = board[destPos.row][destPos.col];

    console.log("dest piece - " + destPiece);

    // add to taken pieces here

    board[currPos.row][currPos.col] = "__";
    board[destPos.row][destPos.col] = currPiece;

    printBoard();
}

const flipBoard = function() {
    const boardGrid = document.getElementById("boardGrid");
    const squaresArray = Array.from(boardGrid.querySelectorAll("div")); // (static, this won't be updated in the for loop, so we can treat it as a copy)
    boardGrid.innerHTML = "";
    for (let i = 7; i > -1; i--){
        for (let j = 7; j > -1 ; j--){
            const arrayNumber = i * 8 + j;
            const piece = squaresArray[arrayNumber]
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
    movePieceOnArray(moveDetails.id, moveDetails.newId)
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
        moveDetails.pieceBoardCoords = convertToRowCol(moveDetails.id);
        moveDetails.pieceName = board[moveDetails.pieceBoardCoords.row][moveDetails.pieceBoardCoords.col];
    }
    else if (moveDetails.type == "second"){
        // function here called check if valid
        // if the move is not valid, reset the move data  
        moveDetails.newId = at;
        moveDetails.type = "first";
        if (isValidMove(moveDetails)) {
            moveDetails.yourMove = false;
            socket.emit("move", {from: moveDetails.id,to: moveDetails.newId,roomId: playerDetails.roomId});
            secondClick(moveDetails.id, moveDetails.newId);
        }
    }
});

socket.on("move", (moveData) => {  // recieved when the other player makes a move
    console.log("move seen")
    const {newPosition, position} = parseMoveData(moveData); // this gives html element data not actual coordinates
    movePieceOnArray(moveData.from, moveData.to);
    movePiece(position, newPosition);
})

// @returns bool which is true if the move is value
const isValidMove = (moveDetails) => { //TO DO
    const {pieceName} = moveDetails; // these give piece coordinates, not the actual piece
    console.log(pieceName);
    if (playerDetails.isPlayerOne && pieceName[0] == "b") {
        return false;
    }
    if (!playerDetails.isPlayerOne && pieceName[0] == "w") {
        return false;
    }
    if (pieceName[0] == "w"){
        if (pieceName[1] == "P" && checkPawnMove(moveDetails)){ // add curr color and oppcolor parameters
            return true;
        }
        else if (pieceName[1] == "R" && checkRookMove(moveDetails, "w", "b")){
            return true;
        }
        else if (pieceName[1] == "N" && checkKnightMove(moveDetails, "w", "b")){
            return true;
        }
        else if (pieceName[1] == "B" && checkBishopMove(moveDetails, "w", "b")){
            return true;
        }
        else if (pieceName[1] == "K" && checkKingMove(moveDetails, "w", "b")){
            return true;
        }
        else if (pieceName[1] == "Q" && checkQueenMove(moveDetails, "w", "b")){
            return true;
        }
        else {
            return false;
        }
    }
    if (pieceName[0] == "b"){
        if (pieceName[1] == "P" && checkPawnMove(moveDetails)){ // add curr color and oppcolor parameters
            return true;
        }
        else if (pieceName[1] == "R" && checkRookMove(moveDetails, "b", "w")){
            return true;
        }
        else if (pieceName[1] == "N" && checkKnightMove(moveDetails, "b", "w")){
            return true;
        }
        else if (pieceName[1] == "B" && checkBishopMove(moveDetails, "b", "w")){
            return true;
        }
        else if (pieceName[1] == "K" && checkKingMove(moveDetails, "b", "w")){
            return true;
        }
        else if (pieceName[1] == "Q" && checkQueenMove(moveDetails, "b", "w")){
            return true;
        }
        else {
            return false;
        }
    }
}

// TO DO: Refactor with convertToRowCol and with the new color system to reduce redundancy
// currColor and oppColor can either be "w" or "b"
const checkPawnMove = (moveData) => {
    const {id, newId, pieceName} = moveData;
    const currRow = id[1]-1;
    const currCol = letterConvert[id[0]];
    const newRow = newId[1] - 1;
    const newCol = letterConvert[newId[0]];
    console.log("piece name in checkpawn  - " + pieceName);
    if (pieceName[0] == "w") {
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
            if (currRow != 1) {
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
    else if (pieceName[0] == "b"){
        if (newRow == currRow - 1) {
            if (newCol == currCol + 1 && board[newRow][newCol][0] == "w"){
                return true;
            }
            else if (newCol == currCol - 1 && board[newRow][newCol][0] == "w"){
                return true;
            }
            else if (newCol == currCol && board[newRow][newCol] == "__"){
                if (newRow == 0){
                    // queen function here  - - will be needed for takes as well (duh)
                }
                return true;
            }
            else {
                return false;
            }
        }
        else if (newRow == currRow - 2) {
            if (currRow != 6) {
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

// this function is used to check if any pieces are "in the way" for 8 possible directions (up, down, left, right, diagonals) - the direction is given by inputting a vertical iterator and a horizontal iterator (i.e. 1, 1 for checking the northwest direction)
// this is used in the checkBishopMove, checkRookMove, and checkQueenMove functions
// returns true iff there is a piece "in the way"
// a piece being at "newPos" or "currPos" will not cause this function to return true
// assumes that newPos will eventually be reached
const inTheWay = (currPos, newPos, vertItr, horiItr) => {
    const checkPos = {row: currPos.row + vertItr, col: currPos.col + horiItr};
    while (checkPos.row != newPos.row || checkPos.col != newPos.col) {
        console.log("checking" + checkPos.row + " " + checkPos.col)
        const checkPieceName = board[checkPos.row][checkPos.col];
        if (checkPieceName != "__") {
            return true;
        }
        checkPos.row += vertItr;
        checkPos.col += horiItr;
    }
    return false;
}

const checkRookMove = (moveData, currColor, oppColor) => {
    const {id, newId, pieceName} = moveData;
    const currPos = convertToRowCol(id);
    const newPos = convertToRowCol(newId);
    const targetName = board[newPos.row][newPos.col];
    // check of the new position is the same as the old position or if the piece was not moved in a straight line
    if (newPos.row == currPos.row && newPos.col == currPos.col || newPos.row != currPos.row && newPos.col != currPos.col) {
        return false;
    }
    // check if a piece got in the way of the move
    if (newPos.row > currPos.row) {
        if (inTheWay(currPos, newPos, 1, 0)){
            return false;
        }
    }
    else if (newPos.row < currPos.row) {
        if (inTheWay(currPos, newPos, -1, 0)){
            return false;
        }
    }
    else if (newPos.col > currPos.col) {
        if (inTheWay(currPos, newPos, 0, 1)){
            return false;
        }
    }
    else { // newPos.col < currPos.col
        if (inTheWay(currPos, newPos, 0, -1)){
            return false;
        }
    }
    // handles the case where a piece is taken
    if (targetName != "__"){
        if (targetName[0] != oppColor) {
            return false;
        }
        else {
            // add to taken pieces FIXME
            return true;
        }
    }
    else {
        return true;
    }
}

const checkKnightMove = (moveData, currColor, oppColor) => {
    const {id, newId, pieceName} = moveData;
    const currPos = convertToRowCol(id);
    const newPos = convertToRowCol(newId);
    const targetName = board[newPos.row][newPos.col];
    // isValid variable used instead of returning so we can check if a piece was targeted later
    let isValid = false;
    // knight can only move to 1 of 8 positions
    if (newPos.row == currPos.row + 2 && newPos.col == currPos.col - 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 2 && newPos.col == currPos.col + 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 2 && newPos.col == currPos.col - 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 2 && newPos.col == currPos.col + 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 1 && newPos.col == currPos.col - 2) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 1 && newPos.col == currPos.col + 2) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 1 && newPos.col == currPos.col - 2) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 1 && newPos.col == currPos.col + 2) {
        isValid = true;
    }
    else {
        isValid = false;
    }
    if (isValid) {
        if (targetName != "__") {
            if (targetName[0] != oppColor){
                // add to taken pieces
                return false;
            }
            return true;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}

const checkBishopMove = (moveData, currColor, oppColor) => {
    const {id, newId, pieceName} = moveData;
    const currPos = convertToRowCol(id);
    const newPos = convertToRowCol(newId);
    const targetName = board[newPos.row][newPos.col];
    // check each of the four directions first
    if (currPos.row < newPos.row && currPos.col < newPos.col) {
        if (inTheWay(currPos, newPos, 1, 1)) {
            return false;
        }
    }
    else if (currPos.row < newPos.row && currPos.col > newPos.col) {
        if (inTheWay(currPos, newPos, 1, -1)) {
            return false;
        }
    }
    else if (currPos.row > newPos.row && currPos.col > newPos.col) {
        if (inTheWay(currPos, newPos, -1, -1)) {
            return false;
        }
    }
    else if (currPos.row > newPos.row && currPos.col < newPos.col) {
        if (inTheWay(currPos, newPos, -1, 1)) {
            return false;
        }
    }
    else {
        return false;
    }
    if (targetName != "__") {
        if (targetName[0] != oppColor){
            return false;
        }
        // handle capture
        return true;
    }
    return true;
}

const checkKingMove = (moveData, currColor, oppColor) => {
    const {id, newId, pieceName} = moveData;
    const currPos = convertToRowCol(id);
    const newPos = convertToRowCol(newId);
    const targetName = board[newPos.row][newPos.col];
    let isValid = false;
    // simply check all eight directions
    if (newPos.row == currPos.row + 1 && newPos.col == currPos.col + 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 1 && newPos.col == currPos.col + 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 1 && newPos.col == currPos.col - 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 1 && newPos.col == currPos.col - 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 0 && newPos.col == currPos.col + 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 0 && newPos.col == currPos.col - 1) {
        isValid = true;
    }
    else if (newPos.row == currPos.row + 1 && newPos.col == currPos.col + 0) {
        isValid = true;
    }
    else if (newPos.row == currPos.row - 1 && newPos.col == currPos.col + 0) {
        isValid = true;
    }
    else {
        return false;
    }
    if (isValid)  {// redundant
        if (targetName != "__"){
            if (targetName[0] != oppColor){
                return false;
            }
            // handleCapture
            return true;
        }
        return true;
    }
    return true;
}

const checkQueenMove = (moveData, currColor, oppColor) => {
    // can just use checkRook and checkBishop
    return checkBishopMove(moveData, currColor, oppColor) || checkRookMove(moveData, currColor, oppColor);
}