export const ArcJetRuleBuilder = {
    rateLimit(requestsPerMinute) {
        return {
            type: 'rateLimit',
            config: {
                requestsPerMinute,
            },
        };
    },
    botProtection(level) {
        return {
            type: 'botProtection',
            config: {
                level,
            },
        };
    },
    ddosProtection(threshold) {
        return {
            type: 'ddosProtection',
            config: {
                threshold,
            },
        };
    }
};
