const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const volumeSlider = document.getElementById("volumeSlider");
const fullScreenBtn = document.getElementById("fullScreenBtn");
const videoSelect = document.getElementById("videoSelect");

playPauseBtn.addEventListener("click", togglePlayPause);

function togglePlayPause() {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "⏸";
  } else {
    video.pause();
    playPauseBtn.textContent = "▶";
  }
}

video.addEventListener("timeupdate", () => {
  const progress = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${progress}%`;
});

document.querySelector(".progress").addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
});

volumeSlider.addEventListener("input", () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
});

fullScreenBtn.addEventListener("click", () => {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  }
});

videoSelect.addEventListener("change", (e) => {
  video.src = e.target.value;
  video.load();
  video.play();
  playPauseBtn.textContent = "⏸";
});

prevBtn.addEventListener("click", () => {
  let currentIndex = videoSelect.selectedIndex;
  if (currentIndex > 0) {
    videoSelect.selectedIndex = currentIndex - 1;
    video.src = videoSelect.value;
    video.load();
    video.play();
    playPauseBtn.textContent = "⏸";
  }
});

nextBtn.addEventListener("click", () => {
  let currentIndex = videoSelect.selectedIndex;
  if (currentIndex < videoSelect.options.length - 1) {
    videoSelect.selectedIndex = currentIndex + 1;
    video.src = videoSelect.value;
    video.load();
    video.play();
    playPauseBtn.textContent = "⏸";
  }
});

// Горячие клавиши
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlayPause();
  }
  if (e.code === "ArrowLeft") {
    video.currentTime = Math.max(0, video.currentTime - 5);
  }
  if (e.code === "ArrowRight") {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
  }
  if (e.code === "KeyM") {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
  }
  if (e.code === "KeyF") {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  }
  if (e.code === "ArrowUp") {
    e.preventDefault();
    video.volume = Math.min(1, video.volume + 0.1);
    volumeSlider.value = video.volume;
    video.muted = false;
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    video.volume = Math.max(0, video.volume - 0.1);
    volumeSlider.value = video.volume;
    video.muted = video.volume === 0;
  }
});
