integrations/olfactory-controller.js
/**
 * Olfactory (Smell) Integration
 * Different scents for different market states
 */

class OlfactoryMarketController {
    constructor() {
        // Scent diffuser mapping
        this.scentMap = {
            // Bullish scents (uplifting)
            bullish_strong: 'citrus_blend', // Orange, lemon, grapefruit
            bullish_weak: 'mint_eucalyptus',
            
            // Bearish scents (grounding)
            bearish_strong: 'cedarwood_sandalwood',
            bearish_weak: 'lavender_chamomile',
            
            // Neutral
            neutral: 'clean_linen',
            
            // Alerts
            high_volatility: 'peppermint_spike', // Sharp, alerting
            fraud_detected: 'smoke_alarm', // Warning scent
            
            // Special events
            all_time_high: 'champagne_notes',
            portfolio_profitable: 'vanilla_cinnamon'
        };
        
        // IoT diffuser devices
        this.diffusers = [];
    }
    
    async connectDiffuser(device) {
        /**
         * Compatible with:
         * - Pura Smart Diffuser
         * - Moodo Aromatherapy Box
         * - Aera Smart Home Fragrance
         * - DIY IoT diffuser (Raspberry Pi + relay)
         */
        
        if (device.type === 'pura') {
            await this.connectPura(device);
        } else if (device.type === 'moodo') {
            await this.connectMoodo(device);
        } else if (device.type === 'diy') {
            await this.connectDIY(device);
        }
        
        this.diffusers.push(device);
    }
    
    async releaseScent(marketState, intensity = 0.5) {
        const scent = this.scentMap[marketState];
        
        for (const diffuser of this.diffusers) {
            await diffuser.activate({
                scent: scent,
                intensity: intensity,
                duration: 30000, // 30 seconds
                fan_speed: intensity * 100
            });
        }
        
        // Log for olfactory memory study
        this.logScentEvent({
            scent,
            marketState,
            timestamp: Date.now()
        });
    }
    
    async enableAmbientScent(room = 'office') {
        /**
         * Continuous subtle scenting based on portfolio performance
         * - Room slowly shifts from lavender (bearish) to citrus (bullish)
         */
        
        setInterval(async () => {
            const portfolioMetrics = await this.getPortfolioMetrics();
            const overallSentiment = portfolioMetrics.net_sentiment;
            
            // Blend scents proportionally
            const bearishIntensity = Math.max(0, -overallSentiment);
            const bullishIntensity = Math.max(0, overallSentiment);
            
            if (bearishIntensity > 0.3) {
                await this.releaseScent('bearish_weak', bearishIntensity);
            } else if (bullishIntensity > 0.3) {
                await this.releaseScent('bullish_weak', bullishIntensity);
            } else {
                await this.releaseScent('neutral', 0.2);
            }
        }, 300000); // Every 5 minutes
    }
}

/**
 * Gustatory (Taste) Integration
 * Edible market indicators via smart beverage system
 */

class GustatoryMarketController {
    constructor() {
        // Taste profiles for market states
        this.tasteMap = {
            bullish: 'sweet', // Success tastes sweet
            bearish: 'bitter', // Losses taste bitter
            volatile: 'sour', // Chaos tastes sour
            stable: 'umami', // Stability tastes savory
            alert: 'spicy' // Alerts taste spicy/hot
        };
    }
    
    async connectSmartBeverage(device) {
        /**
         * Future devices:
         * - Smart water bottle with flavor pods
         * - Automated coffee/tea maker
         * - Cocktail robot (Barsys, Bartesian)
         */
        
        this.beverageDevice = device;
    }
    
    async dispenseTaste(marketState) {
        const taste = this.tasteMap[marketState];
        
        // Example: Smart water bottle adds flavor
        if (this.beverageDevice.type === 'cirkul' || this.beverageDevice.type === 'air_up') {
            await this.beverageDevice.setFlavor({
                profile: taste,
                intensity: 0.5
            });
        }
        
        // Example: Coffee maker adjusts brew
        else if (this.beverageDevice.type === 'smart_coffee') {
            await this.beverageDevice.brew({
                strength: marketState === 'bullish' ? 'bold' : 'mild',
                sweetness: marketState === 'bullish' ? 'high' : 'low'
            });
        }
    }
    
    async createMarketCocktail(portfolio) {
        /**
         * Mix a cocktail representing your portfolio
         * - Sweet ingredients = profitable positions
         * - Bitter ingredients = losing positions
         * - Garnish = overall sentiment
         */
        
        const recipe = {
            base: 'vodka',
            sweet: portfolio.profitRatio * 30, // ml
            bitter: (1 - portfolio.profitRatio) * 30,
            sour: portfolio.volatility * 10,
            garnish: portfolio.sentiment > 0 ? 'mint' : 'lemon_twist'
        };
        
        if (this.beverageDevice.type === 'cocktail_robot') {
            await this.beverageDevice.mix(recipe);
        }
        
        return `Your portfolio cocktail is ready: ${this.describeRecipe(recipe)}`;
    }
}

export default { OlfactoryMarketController, GustatoryMarketController };
