class GustatoryMarketController {
    constructor() {
        this.tasteMap = {
            bullish: 'sweet',
            bearish: 'bitter',
            volatile: 'sour',
            alert: 'spicy'
        };
    }

    async dispenseTaste(marketState) {
        const taste = this.tasteMap[marketState];
        if (this.beverageDevice.type === 'smart_coffee') {
            await this.beverageDevice.brew({
                strength: marketState === 'bullish' ? 'bold' : 'mild',
                sweetness: marketState === 'bullish' ? 'high' : 'low'
            });
        }
    }
}
