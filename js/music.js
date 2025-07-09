console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;


// Redirect buttons for Signup and Login
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".signupbtn").addEventListener("click", () => {
        window.location.href = "signup.html";
    });
    document.querySelector(".loginbtn").addEventListener("click", () => {
        window.location.href = "login.html";
    });
});


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        let songName = song.replaceAll("%20", " ");
        let songPath = `/${currFolder}/${song}`;

        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="svg/music-note-03-stroke-rounded.svg" alt="">
                <div class="info">
                    <div>${songName}</div>
                    
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert play-button" src="svg/play.svg" alt="" data-track="${song}">
                </div>
               
            </li>`;
    }





    // Attach event listeners to play buttons
    document.querySelectorAll(".play-button").forEach(button => {
        button.addEventListener("click", e => {
            let track = e.target.dataset.track;
            playMusic(track);
        });
    });

    // Attach event listeners to download buttons
    document.querySelectorAll(".download-button").forEach(button => {
        button.addEventListener("click", e => {
            let track = e.target.dataset.track;
            downloadMusic(track);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// ✅ New function to handle downloads
function downloadMusic(track) {
    let songUrl = `/${currFolder}/${track}`;

    let a = document.createElement("a");
    a.href = songUrl;
    a.download = track;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Modify index.html - Add loop/shuffle icon
const songButtons = document.querySelector(".songbuttons");
const loopButton = document.createElement("img");
loopButton.width = 35;
loopButton.id = "loop";
loopButton.src = "svg/shuffle.svg";
loopButton.alt = "Shuffle";
songButtons.appendChild(loopButton);

// Modify music.js - Implement shuffle first, then loop functionality
let isLooping = false;
let isShuffling = true;
const loop = document.getElementById("loop");

loop.addEventListener("click", () => {
    if (isShuffling) {
        isShuffling = false;
        isLooping = true;
        loop.src = "svg/loop.svg";
        loop.alt = "Loop";
    } else if (isLooping) {
        isLooping = false;
        isShuffling = true;
        loop.src = "svg/shuffle.svg";
        loop.alt = "Shuffle";
    }
});

currentSong.addEventListener("ended", () => {
    if (isLooping) {
        currentSong.currentTime = 0;
        currentSong.play();
    } else if (isShuffling) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (songs[randomIndex] === currentSong.src.split("/").pop());
        playMusic(songs[randomIndex]);
    } else {
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
        if (index !== -1 && index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); // Restart from the first song
        }
    }
});





async function displayAlbums() {
    try {
        let a = await fetch(`http://127.0.0.1:5501/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        let array = Array.from(anchors);
        let displayCount = 0;

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            let href = e.getAttribute("href");

            if (!href || href === "../" || href === "/" || href === "songs/") continue;

            let folder = href.replace(/^\/|\/$/g, "").trim();
            folder = folder.replace("songs/", "");

            if (!folder || folder === "songs") continue;

            try {
                let jsonUrl = `http://127.0.0.1:5501/songs/${folder}/info.json`;
                let metaResponse = await fetch(jsonUrl);

                if (!metaResponse.ok) {
                    console.error(`Error fetching ${jsonUrl}:`, metaResponse.status, metaResponse.statusText);
                    continue;
                }

                let responseJson = await metaResponse.json();

                // Set data-locked attribute for playlists beyond 3
                const isLocked = displayCount >= 5;

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card" data-locked="${isLocked}">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${responseJson.title}</h2>
                        <p>${responseJson.description}</p>
                    </div>`;

                displayCount++;
            } catch (jsonError) {
                console.error(`Failed to parse JSON for ${folder}:`, jsonError);
            }
        }

        // Attach click handlers to all cards
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                const card = item.currentTarget;
                const folder = card.dataset.folder;
                const isLocked = card.dataset.locked === "true";

                if (isLocked) {
                    alert("Please log in or sign up to access this playlist.");
                    return;
                }

                songs = await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error fetching songs directory:", error);
    }
}







async function main() {
    // Get the list of all the songs
    await getSongs("songs/Bhakti_Bhajan")
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })




}

main() 