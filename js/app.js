(function () {
  const getElement = (id) => document.getElementById(id);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const updateProgress = (state, elements) => () => {
    const duration = state.video.duration;
    const currentTime = state.video.currentTime;

    if (isNaN(duration) || duration === 0) {
      elements.progressBar.style.width = "0%";
      elements.timeDisplay.textContent = "0:00 / 0:00";
      return;
    }

    const percentage = (currentTime / duration) * 100;
    elements.progressBar.style.width = `${percentage}%`;
    elements.timeDisplay.textContent = `${formatTime(
      currentTime
    )} / ${formatTime(duration)}`;
  };

  const seek = (state, elements) => (e) => {
    const rect = elements.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    state.video.currentTime = state.video.duration * percentage;
  };

  const togglePlay = (state, elements) => () => {
    if (state.video.paused) {
      state.video.play();
      elements.playPauseBtn.textContent = "⏸";
    } else {
      state.video.pause();
      elements.playPauseBtn.textContent = "▶";
    }
  };

  const prevVideo = (state) => () => {
    if (state.currentVideoIndex > 0) {
      playVideo(state.currentVideoIndex - 1)(state);
    }
  };

  const nextVideo = (state) => () => {
    if (state.currentVideoIndex < state.videos.length - 1) {
      playVideo(state.currentVideoIndex + 1)(state);
    }
  };

  const updateNavigationButtons = (state, elements) => () => {
    elements.prevVideoBtn.disabled = state.currentVideoIndex <= 0;
    elements.nextVideoBtn.disabled =
      state.currentVideoIndex >= state.videos.length - 1 ||
      state.currentVideoIndex === -1;
  };

  const updateTitle = (state, elements) => () => {
    elements.videoTitle.textContent =
      state.currentVideoIndex === -1 || !state.videos[state.currentVideoIndex]
        ? "Video nomi"
        : state.videos[state.currentVideoIndex].name;
  };

  const playVideo = (index) => (state, elements) => {
    state.currentVideoIndex = index;
    const video = state.videos[index];
    state.video.src = video.url;
    state.video.load();
    state.video.play();
    elements.playPauseBtn.textContent = "⏸";

    updateTitle(state, elements)();

    const items = elements.playlist.querySelectorAll(".playlist-item");
    items.forEach((item) => item.classList.remove("active"));
    items[index].classList.add("active");

    updateNavigationButtons(state, elements)();
  };

  const addToPlaylist = (name, index) => (state, elements) => {
    const item = document.createElement("div");
    item.classList.add("playlist-item");
    item.textContent = name;
    item.dataset.index = index;
    item.addEventListener("click", () => playVideo(index)(state, elements));
    elements.playlist.appendChild(item);
  };

  const handleFileSelect = (state, elements) => (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const videoIndex = state.videos.length;
      state.videos.push({ name: file.name, url });
      addToPlaylist(file.name, videoIndex)(state, elements);

      if (state.currentVideoIndex === -1 && index === 0) {
        playVideo(0)(state, elements);
      }
    });
  };

  const toggleFullscreen = (state) => () => {
    if (!document.fullscreenEnabled) {
      console.log("Brauzeringiz to'liq ekran rejimini qo'llab-quvvatlamaydi.");
      return;
    }

    if (!document.fullscreenElement) {
      state.video.parentElement.requestFullscreen().catch((err) => {
        console.log("To'liq ekranga o'tish muvaffaqiyatsiz bo'ldi:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.log("To'liq ekrandan chiqish muvaffaqiyatsiz bo'ldi:", err);
      });
    }
  };

  const toggleSettings = (elements) => () => {
    elements.settingsMenu.classList.toggle("active");
  };

  const setPlaybackRate = (state, elements) => (e) => {
    const target = e.target.closest(".settings-sub-option");
    if (!target) return;

    const rate = parseFloat(target.dataset.rate);
    state.video.playbackRate = rate;
    elements.currentPlaybackRate.textContent = `${rate}x`;

    const options = elements.playbackRateMenu.querySelectorAll(
      ".settings-sub-option"
    );
    options.forEach((opt) => opt.classList.remove("active"));
    target.classList.add("active");
  };

  const setQuality = (elements) => (e) => {
    const target = e.target.closest(".settings-sub-option");
    if (!target) return;

    const quality = target.dataset.quality;
    elements.currentQuality.textContent =
      quality === "auto" ? "Avto rejim" : quality;

    console.log(`Tallangan video sifati: ${quality}`);

    const options = elements.qualityMenu.querySelectorAll(
      ".settings-sub-option"
    );
    options.forEach((opt) => opt.classList.remove("active"));
    target.classList.add("active");
  };

  const closeSettingsOnOutsideClick = (elements) => (e) => {
    if (
      !elements.settingsMenu.contains(e.target) &&
      e.target !== elements.settingsBtn
    ) {
      elements.settingsMenu.classList.remove("active");
    }
  };

  const handleKeyboard = (state) => (e) => {
    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay(state, elements)();
        break;
      case "ArrowLeft":
        state.video.currentTime = Math.max(0, state.video.currentTime - 10);
        break;
      case "ArrowRight":
        state.video.currentTime = Math.min(
          state.video.duration,
          state.video.currentTime + 10
        );
        break;
      case "KeyF":
        toggleFullscreen(state)();
        break;
    }
  };

  const initVideoPlayer = () => {
    const elements = {
      video: getElement("videoPlayer"),
      playPauseBtn: getElement("playPauseBtn"),
      prevVideoBtn: getElement("prevVideoBtn"),
      nextVideoBtn: getElement("nextVideoBtn"),
      progressContainer: getElement("progressContainer"),
      progressBar: getElement("progressBar"),
      timeDisplay: getElement("timeDisplay"),
      fullscreenBtn: getElement("fullscreenBtn"),
      settingsBtn: getElement("settingsBtn"),
      settingsMenu: getElement("settingsMenu"),
      playbackRateMenu: getElement("playbackRateMenu"),
      qualityMenu: getElement("qualityMenu"),
      currentPlaybackRate: getElement("currentPlaybackRate"),
      currentQuality: getElement("currentQuality"),
      videoUpload: getElement("videoUpload"),
      videoTitle: getElement("videoTitle"),
      playlist: getElement("playlist"),
    };

    const state = {
      video: elements.video,
      videos: [],
      currentVideoIndex: -1,
    };

    elements.playPauseBtn.addEventListener(
      "click",
      togglePlay(state, elements)
    );
    elements.prevVideoBtn.addEventListener("click", prevVideo(state));
    elements.nextVideoBtn.addEventListener("click", nextVideo(state));
    elements.video.addEventListener("click", togglePlay(state, elements));
    elements.video.addEventListener(
      "timeupdate",
      updateProgress(state, elements)
    );
    elements.progressContainer.addEventListener("click", seek(state, elements));
    elements.fullscreenBtn.addEventListener("click", toggleFullscreen(state));
    elements.settingsBtn.addEventListener("click", toggleSettings(elements));
    elements.playbackRateMenu.addEventListener(
      "click",
      setPlaybackRate(state, elements)
    );
    elements.qualityMenu.addEventListener("click", setQuality(elements));
    elements.videoUpload.addEventListener(
      "change",
      handleFileSelect(state, elements)
    );
    document.addEventListener("keydown", handleKeyboard(state));
    document.addEventListener("click", closeSettingsOnOutsideClick(elements));

    updateTitle(state, elements)();
    updateNavigationButtons(state, elements)();
  };

  document.addEventListener("DOMContentLoaded", initVideoPlayer);
})();
