class OlfactoryMarketController {
    constructor() {
        this.scentMap = {
            bullish_strong: 'citrus_blend',
            bearish_strong: 'cedarwood_sandalwood',
            high_volatility: 'peppermint_spike',
            all_time_high: 'champagne_notes'
        };
    }

    async releaseScent(marketState, intensity = 0.5) {
        const scent = this.scentMap[marketState];
        for (const diffuser of this.diffusers) {
            await diffuser.activate({
                scent,
                intensity,
                duration: 30000,
                fan_speed: intensity * 100
            });
        }
    }
}
