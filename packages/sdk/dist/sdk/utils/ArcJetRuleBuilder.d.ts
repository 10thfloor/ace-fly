import type { ArcJetRule } from "../constructs/ArcJetProtection";
export declare const ArcJetRuleBuilder: {
    rateLimit(requestsPerMinute: number): ArcJetRule;
    botProtection(level: "low" | "medium" | "high"): ArcJetRule;
    ddosProtection(threshold: number): ArcJetRule;
};
