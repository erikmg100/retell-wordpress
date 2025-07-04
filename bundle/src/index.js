import { RetellWebClient } from 'retell-client-js-sdk';

// Make RetellWebClient globally available
window.RetellWebClient = RetellWebClient;

// Create a simple interface for WordPress
window.RetellWordPress = {
  client: null,
  isActive: false,
  
  async startCall(backendUrl) {
    try {
      // Get access token from your backend
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (!data.success || !data.access_token) {
        throw new Error(data.error || 'Failed to get access token');
      }
      
      // Initialize client if needed
      if (!this.client) {
        this.client = new RetellWebClient();
        this.setupEventListeners();
      }
      
      // Start the call
      await this.client.startCall({
        accessToken: data.access_token,
        sampleRate: 24000,
        captureDeviceId: "default",
        playbackDeviceId: "default"
      });
      
      this.isActive = true;
      return { success: true };
      
    } catch (error) {
      console.error('Error starting call:', error);
      return { success: false, error: error.message };
    }
  },
  
  stopCall() {
    if (this.client && this.isActive) {
      this.client.stopCall();
      this.isActive = false;
    }
  },
  
  setupEventListeners() {
    this.client.on('call_started', () => {
      console.log('Call started');
      if (window.onRetellCallStarted) window.onRetellCallStarted();
    });
    
    this.client.on('call_ended', () => {
      console.log('Call ended');
      this.isActive = false;
      if (window.onRetellCallEnded) window.onRetellCallEnded();
    });
    
    this.client.on('agent_start_talking', () => {
      if (window.onRetellAgentTalking) window.onRetellAgentTalking(true);
    });
    
    this.client.on('agent_stop_talking', () => {
      if (window.onRetellAgentTalking) window.onRetellAgentTalking(false);
    });
    
    this.client.on('update', (update) => {
      if (window.onRetellUpdate) window.onRetellUpdate(update);
    });
    
    this.client.on('error', (error) => {
      console.error('Retell error:', error);
      this.isActive = false;
      if (window.onRetellError) window.onRetellError(error);
    });
  }
};

console.log('RetellWordPress bundle loaded successfully');
