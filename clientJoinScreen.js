const moveDetails = {type: "first", id: null, newId: null};

window.addEventListener('DOMContentLoaded', () => {
    makeClickEvents();

    const roomForm = document.getElementById("RoomInfoForm");
    const name_ = document.getElementById("name");
    const roomId_ = document.getElementById("roomId");
    roomForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = name_.value.trim();
        const roomId = roomId_.value.trim();
        console.log("name: " + name + " roomId: " + roomId);

        const response = await fetch('/addPlayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName: name, id: roomId }),///// NOTE: you just JSON.stringify the data you are sending
        });

        if (response.ok) {
            // If successful, take the new message from the server's response
            name_.value = '';
            roomId_.value = '';
            const roomInfo = await response.json();
            if (roomInfo.joinType == "first player"){
                localStorage.setItem('firstPlayerName', name);
                localStorage.setItem('secondPlayerName', '');
                localStorage.setItem('isFirst', true);
                localStorage.setItem('id', roomId);
                window.location.href = 'game.html';
            }
            else if (roomInfo.joinType == "second player"){
                localStorage.setItem('firstPlayerName', name);
                localStorage.setItem('secondPlayerName', roomInfo.otherPlayer);
                localStorage.setItem('isFirst', false);
                localStorage.setItem('id', roomId);
                window.location.href = 'game.html';
            }
            else {
                const roomFull = document.getElementById("roomFull");
                roomFull.innerHTML="Room full, try again";
            }
        } 
    });
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