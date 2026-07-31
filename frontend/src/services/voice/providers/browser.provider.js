class BrowserProvider {
  constructor() {
    this.name = 'browser';
    this.activeUtterance = null;
    this.synth = window.speechSynthesis;
  }

  async checkAvailability() {
    return !!window.speechSynthesis;
  }

  getVoiceForId(voices, voiceId) {
    const isMale = voiceId && voiceId.toLowerCase().includes('male');

    if (isMale) {
      return (
        voices.find(v => v.name === 'Google UK English Male') ||
        voices.find(v => v.name === 'Microsoft David - English (United States)') ||
        voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
        voices.find(v => v.name === 'Daniel' && v.lang.startsWith('en')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en'))
      );
    } else {
      return (
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name === 'Samantha') ||
        voices.find(v => v.name === 'Karen') ||
        voices.find(v => v.name === 'Microsoft Zira - English (United States)') ||
        voices.find(v => v.name === 'Microsoft Hazel Desktop - English (Great Britain)') ||
        voices.find(v => v.name === 'Microsoft Sonia Online (Natural) - English (United Kingdom)') ||
        voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang === 'en-IN') ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang.startsWith('en'))
      );
    }
  }

  async speak(text, options) {
    return new Promise((resolve, reject) => {
      this.stop(); // Clear any existing speech and its callbacks
      
      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        this.activeUtterance = utterance;

        const voices = this.synth.getVoices();
        const voiceId = options.voiceId || '';
        const isMale = voiceId.toLowerCase().includes('male');
        
        const voice = this.getVoiceForId(voices, voiceId);
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || 'en-US';
        utterance.rate = 0.92;
        utterance.pitch = isMale ? 0.85 : 1.05;
        utterance.volume = 1.0;

        if (options.onStart) utterance.onstart = options.onStart;
        
        utterance.onend = () => {
          this.activeUtterance = null;
          if (options.onEnd) options.onEnd();
          resolve();
        };

        utterance.onerror = (e) => {
          this.activeUtterance = null;
          if (options.onError) options.onError(e);
          reject(e);
        };

        this.synth.speak(utterance);
      };

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        this.synth.onvoiceschanged = () => {
          this.synth.onvoiceschanged = null;
          doSpeak();
        };
      }
    });
  }

  stop() {
    if (this.activeUtterance) {
      // Clear callbacks to avoid race conditions when canceling
      this.activeUtterance.onstart = null;
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }
    if (this.synth?.speaking) {
      this.synth.cancel();
    }
  }
}

export default new BrowserProvider();
