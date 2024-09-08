import type { ArcJetRule } from "../constructs/ArcJetProtection";

export const ArcJetRuleBuilder = {
  rateLimit(requestsPerMinute: number): ArcJetRule {
    return {
      type: 'rateLimit',
      config: {
        requestsPerMinute,
      },
    };
  },

  botProtection(level: 'low' | 'medium' | 'high'): ArcJetRule {
    return {
      type: 'botProtection',
      config: {
        level,
      },
    };
  },

  ddosProtection(threshold: number): ArcJetRule {
    return {
      type: 'ddosProtection',
      config: {
        threshold,
      },
    };
  }
};