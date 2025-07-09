// 
document.addEventListener("DOMContentLoaded", function () {
    const requestForm = document.getElementById("song-request-form");
    const requestInput = document.getElementById("song-request-input");
    const userInput = document.getElementById("user-name-input");
    const requestList = document.getElementById("song-requests-list");

    if (requestForm) {
        requestForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const songName = requestInput.value.trim();
            const requester = userInput.value.trim();
            const timestamp = new Date().toLocaleString();

            if (songName && requester) {
                const response = await fetch("http://localhost:5000/api/song-request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ song: songName, requester, time: timestamp }),
                });

                if (response.ok) {
                    alert("Song request submitted!");
                    requestInput.value = "";
                    userInput.value = "";
                    loadRequests(); // refresh list
                } else {
                    alert("Error submitting request.");
                }
            } else {
                alert("Please enter both song name and your name.");
            }
        });
    }

    async function loadRequests() {
        const response = await fetch("http://localhost:5000/api/song-requests");
        const requests = await response.json();
        if (requestList) {
            requestList.innerHTML = "";
            requests.forEach((request, index) => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${request.song}</strong> - Requested by ${request.requester} on ${request.time}`;
                requestList.appendChild(li);
            });
        }
    }

    for (let i = 0; i < localStorage.length; i++) {
        let username = localStorage.key(i);
        if (
            username === "adminLoggedIn" ||
            username === "songRequests" ||
            username === "likedSongs"  // ✅ Add this line
        ) continue;
    }    
    
    if (requestList) {
        loadRequests();
    }
});


