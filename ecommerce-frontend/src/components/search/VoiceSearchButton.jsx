import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

export default function VoiceSearchButton({ onResult, onListening, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (onListening) onListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (onListening) onListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onListening) onListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult, onListening]);

  if (!isSupported) {
    return null;
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-1 rounded-full transition-colors flex items-center justify-center ${
        isListening
          ? 'text-red-500 animate-pulse ring-2 ring-red-500/50'
          : 'text-gray-400 hover:text-brand'
      } ${className}`}
      title="Search by voice"
      aria-label="Search by voice"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
