// Sample Bollywood songs playlist
const songs = [
    {
        id: 1,
        title: "Chaiyya Chaiyya",
        artist: "A.R. Rahman",
        album: "Dil Se",
        duration: 303,
        albumArt: "https://via.placeholder.com/300?text=Chaiyya+Chaiyya",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Kal Ho Naa Ho",
        artist: "Sonu Nigam",
        album: "Kal Ho Naa Ho",
        duration: 331,
        albumArt: "https://via.placeholder.com/300?text=Kal+Ho+Naa+Ho",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        id: 3,
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        album: "Aashiqui 2",
        duration: 281,
        albumArt: "https://via.placeholder.com/300?text=Tum+Hi+Ho",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        id: 4,
        title: "Baarish Ban Jaana",
        artist: "Asha Parekh",
        album: "Cocktail",
        duration: 217,
        albumArt: "https://via.placeholder.com/300?text=Baarish+Ban+Jaana",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        id: 5,
        title: "Ye Dil Deewana",
        artist: "KK",
        album: "Chandni Bar",
        duration: 289,
        albumArt: "https://via.placeholder.com/300?text=Ye+Dil+Deewana",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    }
];

// Player state
let currentSongIndex = 0;
let isPlaying = false;

// Get DOM elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumArt = document.getElementById('albumArt');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeDisplay = document.getElementById('volumeDisplay');
const playlistContainer = document.getElementById('playlistContainer');

// Initialize
function init() {
    loadSong(currentSongIndex);
    renderPlaylist();
    audioPlayer.volume = volumeSlider.value / 100;
}

// Load song
function loadSong(index) {
    const song = songs[index];
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.src = song.albumArt;
    audioPlayer.src = song.url;
    durationEl.textContent = formatTime(song.duration);
    
    // Update active playlist item
    updateActivePlaylistItem();
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
}

// Update play button state
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    playBtn.textContent = '⏸ Pause';
    playBtn.classList.add('playing');
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    playBtn.classList.remove('playing');
});

// Next song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
}

// Previous song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
}

// Auto play next song when current ends
audioPlayer.addEventListener('ended', nextSong);

// Update progress bar
audioPlayer.addEventListener('timeupdate', () => {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

// Seek to position
const progressBar = document.querySelector('.progress-bar');
progressBar.addEventListener('click', (e) => {
    const clickX = e.offsetX;
    const width = progressBar.offsetWidth;
    audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    audioPlayer.volume = volume / 100;
    volumeDisplay.textContent = volume + '%';
});

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Render playlist
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentSongIndex) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        item.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(index);
            audioPlayer.play();
        });
        playlistContainer.appendChild(item);
    });
}

// Update active playlist item
function updateActivePlaylistItem() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);
