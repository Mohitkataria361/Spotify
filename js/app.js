let currentSong = new Audio();
let play = document.getElementById("play");
let currFolder;
let songs;
let cardContainer = document.querySelector(".cardContainer");
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  //console.log(songs);

  //play the first song
  // var audio = new Audio(songs[0]);
  // audio.play();
  let songUL = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = ""; // Clear existing list items
  for (const song of songs) {
    songUL.innerHTML += `<li> 
    <img class="invert" src="img/music.svg" alt="music">
              <div class="info">
                <div>
                 ${decodeURIComponent(song).split(".mp3")[0]}
                </div>
                <div>
                  
                </div>
              </div>
            <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="img/pause.svg" alt="music">
            </div>
    
     </li>`;
  }
  // attach an event listener to each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML.trim()+".mp3");

      let song_to_be_played =
        e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3";
      playMusic(song_to_be_played);
    });
  });
  return songs;
}
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/play.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(
    ".mp3",
    ""
  );
  document.querySelector(".songtime").innerHTML = "00/00";
};
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="playButton">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Green circle background -->
                  <circle cx="25" cy="25" r="24" fill="green" />

                  <!-- Original SVG scaled and centered, with black stroke -->
                  <g transform="translate(13, 13) scale(1.1)">
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="black"
                      stroke-width="1.5"
                      fill="#000"
                      stroke-linejoin="round"
                    />
                  </g>
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //load the playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}
async function main() {
  //get the list of songs from the server
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  //Display all the albums on the page
  displayAlbums();
  //Attach an event listener to play, next , previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/play.svg";
    } else {
      currentSong.pause();
      play.src = "img/pause.svg";
    }
  });
  //listen for time update
  currentSong.addEventListener("timeupdate", () => {
    let presentTime = formatTime(currentSong.currentTime);
    let duration = formatTime(currentSong.duration);

    document.querySelector(
      ".songtime"
    ).innerHTML = `${presentTime}  /  ${duration}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //add an event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      //console.log(parseInt(e.target.value));
    });
  //add an event listener to mute the track
  document.querySelector(".volume >img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 100;
    }
  });
}
main();
