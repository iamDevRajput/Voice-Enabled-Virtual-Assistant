class OmniVoiceProvider {
  constructor() {
    this.name = 'omnivoice';
    this.baseUrl = import.meta.env.VITE_OMNIVOICE_URL || 'http://localhost:3900';
    this.audioElement = null;
    this.audioUrl = null;
    this.isAvailable = null;
    this.lastCheckTime = 0;
  }

  async checkAvailability() {
    // Cache availability check for 30 seconds to optimize performance
    const now = Date.now();
    if (this.isAvailable !== null && (now - this.lastCheckTime < 30000)) {
      return this.isAvailable;
    }

    try {
      // Check the models endpoint to verify the server is up
      const res = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        signal: AbortSignal.timeout(1500) // Fast timeout to avoid freezing UI
      });
      this.isAvailable = res.ok;
    } catch (error) {
      this.isAvailable = false;
    }
    this.lastCheckTime = Date.now();
    return this.isAvailable;
  }

  async speak(text, options) {
    this.stop(); // Stop any active playback, clear event listeners, and revoke URLs

    return new Promise(async (resolve, reject) => {
      try {
        const voiceId = options.voiceId || 'female_1'; // Use passed voiceId or default
        
        const response = await fetch(`${this.baseUrl}/v1/audio/speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voiceId, 
            response_format: 'mp3'
          })
        });

        if (!response.ok) {
          throw new Error('OmniVoice API returned ' + response.status);
        }

        const blob = await response.blob();
        this.audioUrl = URL.createObjectURL(blob);
        this.audioElement = new Audio(this.audioUrl);

        if (options.onStart) {
          this.audioElement.onplay = options.onStart;
        }

        this.audioElement.onended = () => {
          this.cleanup();
          if (options.onEnd) options.onEnd();
          resolve();
        };

        this.audioElement.onerror = (e) => {
          this.cleanup();
          if (options.onError) options.onError(e);
          reject(new Error('Audio playback failed'));
        };

        await this.audioElement.play();
      } catch (error) {
        this.cleanup();
        if (options.onError) options.onError(error);
        reject(error);
      }
    });
  }

  cleanup() {
    if (this.audioElement) {
      this.audioElement.onplay = null;
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
      this.audioElement = null;
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeAttribute('src');
      this.audioElement.load();
    }
    this.cleanup();
  }
}

export default new OmniVoiceProvider();
