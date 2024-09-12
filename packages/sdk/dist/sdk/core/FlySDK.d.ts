import { FlyApiClient } from "../api/FlyApiClient";
export interface IFlySDKConfig {
    apiToken: string;
}
export declare class FlySDK {
    private apiClient;
    constructor(config: IFlySDKConfig);
    getApiClient(): FlyApiClient;
}
