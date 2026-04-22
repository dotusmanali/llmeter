import { useEffect, useRef } from 'react';

export const useSoundEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playClick = () => {
    initAudio();
    if (!audioCtx.current) return;
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }

    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioCtx.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.current.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.02, audioCtx.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    oscillator.start();
    oscillator.stop(audioCtx.current.currentTime + 0.1);
  };

  const playHumm = () => {
    initAudio();
    if (!audioCtx.current) return;

    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(60, audioCtx.current.currentTime);

    gainNode.gain.setValueAtTime(0.005, audioCtx.current.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    oscillator.start();
    return () => oscillator.stop();
  };

  return { playClick, playHumm };
};
