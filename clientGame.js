const moveDetails = {type: "first", id: null, newId: null, started: false, yourMove: false};

window.addEventListener('DOMContentLoaded', () => {
    makeClickEvents();
    const firstPlayerName = localStorage.getItem('firstPlayerName');
    const secondPlayerName = localStorage.getItem('secondPlayerName');
    const id = localStorage.getItem('id');
    const isFirst = localStorage.getItem('isFirst');
    console.log("name 1 - " + firstPlayerName + " name 2 - " + secondPlayerName + " isFirst - " + isFirst);
    document.getElementById('gameId').innerText = "Game ID: " + id;
    document.getElementById("nameFirstPlayer").innerText = "Player 1: " + firstPlayerName;
    document.getElementById("nameSecondPlayer").innerText = "Player 2: " + secondPlayerName;
    if (!isFirst){
        //flip the board
    }
});

document.addEventListener("move", (e) => {
    const { at } = e.detail;
    if (moveDetails.type == "first"){
        moveDetails.id = at;
        moveDetails.type = "second";
    }
    else if (moveDetails.type == "second"){
        moveDetails.newId = at;
        moveDetails.type = "first";
        secondClick(moveDetails.newId, moveDetails.id);
    }
});

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
    if (newId == id) {
        const evt = new CustomEvent("secondMove", { detail: { after: id}});
        document.dispatchEvent(evt);
    }
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