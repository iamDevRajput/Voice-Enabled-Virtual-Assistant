import omniVoiceProvider from './providers/omnivoice.provider';
import browserProvider from './providers/browser.provider';

export const STATUS = {
  READY: 'READY',
  UNAVAILABLE: 'UNAVAILABLE',
  FALLBACK: 'FALLBACK'
};

class VoiceService {
  constructor() {
    // Providers ordered by priority. Add new providers here (e.g. ElevenLabsProvider)
    this.providers = [omniVoiceProvider, browserProvider];
    this.activeProvider = null;
    this.status = STATUS.UNAVAILABLE;
  }

  // Auto-detect the best available provider
  async init() {
    for (const provider of this.providers) {
      const isAvailable = await provider.checkAvailability();
      if (isAvailable) {
        this.activeProvider = provider;
        this.status = provider.name === 'browser' ? STATUS.FALLBACK : STATUS.READY;
        console.log(`[VoiceService] Selected provider: ${provider.name} (Status: ${this.status})`);
        return;
      }
    }
    
    // If no provider is available (unlikely since browser is always there)
    this.status = STATUS.UNAVAILABLE;
    console.warn(`[VoiceService] No TTS providers are available.`);
  }

  async speak(text, options = {}) {
    if (!this.activeProvider) {
      await this.init();
    }

    if (!this.activeProvider) {
      console.warn("[VoiceService] Cannot speak, no provider available.");
      if (options.onError) options.onError(new Error('No provider available'));
      return;
    }

    // Intercept options to prevent the primary provider from triggering UI error states during fallback
    const primaryOptions = {
      ...options,
      onError: (e) => {
        // Suppress UI error callback; we will handle it via Promise rejection and fallback
        console.log(`[VoiceService] Suppressed error callback for ${this.activeProvider.name}, preparing fallback.`);
      }
    };

    try {
      await this.activeProvider.speak(text, primaryOptions);
    } catch (error) {
      console.warn(`[VoiceService] Provider ${this.activeProvider.name} failed. Falling back...`, error);
      
      // Try fallback to browser provider explicitly if the primary failed during execution
      if (this.activeProvider.name !== 'browser') {
        this.activeProvider = browserProvider;
        this.status = STATUS.FALLBACK;
        console.log(`[VoiceService] Switched to provider: ${this.activeProvider.name} (Status: ${this.status})`);
        
        // Pass the original options to the final fallback so it can accurately report errors to the UI
        await this.activeProvider.speak(text, options).catch(err => {
           console.error("[VoiceService] Fallback provider also failed.", err);
        });
      } else {
        // If the browser provider was the active one and it failed, notify UI directly
        if (options.onError) options.onError(error);
      }
    }
  }

  stop() {
    if (this.activeProvider) {
      this.activeProvider.stop();
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
