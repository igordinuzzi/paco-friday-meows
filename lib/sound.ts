// Swap the file at public/audio/meow.mp3 with Paco's real recording whenever
// it's ready — nothing else in the app needs to change.
const MEOW_SRC = "/audio/meow.mp3";

let meowAudio: HTMLAudioElement | null = null;

function getMeowAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!meowAudio) {
    meowAudio = new Audio(MEOW_SRC);
    meowAudio.preload = "auto";
  }
  return meowAudio;
}

export function playMeow(): void {
  const audio = getMeowAudio();
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore playback failures (missing file, autoplay restrictions, etc).
  });
}
