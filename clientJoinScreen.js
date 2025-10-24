//const moveDetails = {type: "first", id: null, newId: null};

window.addEventListener('DOMContentLoaded', () => {

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
            body: JSON.stringify({ playerName: name, id: roomId }),
        });

        if (response.ok) {
            // If successful, take the new message from the server's response
            name_.value = '';
            roomId_.value = '';
            const roomInfo = await response.json();
            if (roomInfo.joinType == "first player"){
                localStorage.setItem('firstPlayerName', name);
                localStorage.setItem('secondPlayerName', '');
                localStorage.setItem('isFirst', 'true');
                localStorage.setItem('id', roomId);
                window.location.href = 'game.html';
            }
            else if (roomInfo.joinType == "second player"){
                localStorage.setItem('firstPlayerName', roomInfo.otherPlayer);
                localStorage.setItem('secondPlayerName', name);
                localStorage.setItem('isFirst', 'false');
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