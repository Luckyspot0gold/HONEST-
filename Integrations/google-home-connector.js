integrations/google-home-connector.js
/**
 * Google Home / Nest Integration
 * Makes your house play McCrea Market Metrics
 */

import { SmartHomeV1 } from 'actions-on-google';
import { StructuredResponse } from '@assistant/conversation';

class HonestSmartHomeController {
    constructor() {
        this.app = new SmartHomeV1();
        this.bellFrequencies = [86, 111.11, 432, 753, 1074, 1395, 1618];
        this.activeSpeakers = new Map();
    }
    
    // ==========================================
    // GOOGLE HOME / NEST HUB INTEGRATION
    // ==========================================
    
    async playMarketTone(asset, device) {
        // Get current market metrics
        const metrics = await this.fetchMarketMetrics(asset);
        
        // Map to bell layer
        const bellLayer = this.calculateBellLayer(metrics.rsi);
        const frequency = this.bellFrequencies[bellLayer];
        
        // Generate audio URL
        const audioUrl = this.generateToneUrl(frequency, metrics.coherence);
        
        // Cast to Google Home
        await this.castToDevice(device, {
            type: 'AUDIO',
            url: audioUrl,
            metadata: {
                title: `${asset} Market Alert`,
                artist: 'H.O.N.E.S.T. Oracle',
                album: 'McCrea Market Metrics',
                albumArt: `https://rangis-cognition-engine.base44.app/bell-${bellLayer}.png`
            }
        });
        
        return {
            spoken: `Playing ${asset} market tone at ${frequency} Hz. Current state: ${metrics.decision}`,
            display: this.formatDisplayCard(asset, metrics)
        };
    }
    
    async setMarketAlerts(asset, threshold) {
        // Set up continuous monitoring
        return {
            spoken: `I'll alert you when ${asset} crosses ${threshold}. You'll hear the bell change.`,
            card: {
                title: 'Market Alert Set',
                subtitle: `${asset} @ ${threshold}`,
                image: 'https://rangis-cognition-engine.base44.app/alert-icon.png'
            }
        };
    }
    
    async speakMarketSummary(asset) {
        const metrics = await this.fetchMarketMetrics(asset);
        
        const summary = `
            ${asset} is currently ${metrics.decision.toLowerCase()}.
            Coherence is ${(metrics.coherence * 100).toFixed(0)} percent.
            Momentum exhaustion is at ${(metrics.exhaustion * 100).toFixed(0)} percent.
            The market is playing bell ${this.calculateBellLayer(metrics.rsi) + 1} at ${this.bellFrequencies[this.calculateBellLayer(metrics.rsi)]} hertz.
        `;
        
        return summary;
    }
    
    // ==========================================
    // AMBIENT MARKET PRESENCE
    // ==========================================
    
    async enableAmbientMode(rooms = ['living_room', 'office']) {
        /**
         * Ambient mode: Your house "breathes" with the market
         * - Lights pulse with volatility
         * - Background tones at market frequency
         * - Volume proportional to momentum
         */
        
        for (const room of rooms) {
            // Get all smart devices in room
            const devices = await this.getDevicesInRoom(room);
            
            // Start ambient stream
            devices.speakers.forEach(speaker => {
                this.startAmbientStream(speaker);
            });
            
            devices.lights.forEach(light => {
                this.syncLightToPulse(light);
            });
            
            devices.displays.forEach(display => {
                this.showEigenstateVisualization(display);
            });
        }
        
        return `Ambient market mode enabled in ${rooms.join(', ')}`;
    }
    
    startAmbientStream(speaker) {
        // Continuous background tone that shifts with market
        const streamUrl = 'https://rangis-cognition-engine.base44.app/stream/ambient';
        
        this.castToDevice(speaker, {
            type: 'STREAM',
            url: streamUrl,
            volume: 0.2, // Quiet background
            loop: true
        });
    }
    
    // ==========================================
    // VOICE COMMANDS
    // ==========================================
    
    registerVoiceCommands() {
        // "Hey Google, what's Bitcoin doing?"
        this.app.onQuery('market_status', async (conv, params) => {
            const asset = params.asset || 'BTC';
            const summary = await this.speakMarketSummary(asset);
            
            conv.add(summary);
            await this.playMarketTone(asset, conv.device);
        });
        
        // "Hey Google, play my portfolio"
        this.app.onQuery('portfolio_audio', async (conv) => {
            const portfolio = await this.getUserPortfolio(conv.user.id);
            
            // Play each asset's tone in sequence
            for (const asset of portfolio) {
                await this.playMarketTone(asset.symbol, conv.device);
                await this.delay(2000); // 2 second gap
            }
            
            conv.add('Portfolio sonification complete');
        });
        
        // "Hey Google, set a market alert for Ethereum"
        this.app.onQuery('set_alert', async (conv, params) => {
            const response = await this.setMarketAlerts(
                params.asset,
                params.threshold
            );
            conv.add(response.spoken);
        });
        
        // "Hey Google, activate market mode"
        this.app.onQuery('ambient_mode', async (conv) => {
            await this.enableAmbientMode();
            conv.add('Your home is now synchronized with the market');
        });
    }
}

// Export
export default HonestSmartHomeController;
