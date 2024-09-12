import { FlyMachineType } from "../types/FlyMachineTypes";
import { FlyHttpServiceConcurrencyType } from "../types/FlyHttpServiceConcurrencyTypes";
export declare const DefaultConfigs: {
    FlyHttpService: {
        internal_port: number;
        force_https: true;
        auto_start_machines: true;
        auto_stop_machines: false;
        min_machines_running: number;
        max_machines_running: number;
        processes: string[];
        concurrency: {
            type: FlyHttpServiceConcurrencyType.CONNECTIONS;
            soft_limit: number;
            hard_limit: number;
        };
        machineType: FlyMachineType.SHARED_CPU_1X;
    };
    FlyFirewall: {
        defaultRules: ({
            action: "allow";
            protocol: "tcp";
            ports: number[];
            source: string;
            description: string;
            priority: number;
            destination?: undefined;
        } | {
            action: "deny";
            protocol: "tcp";
            ports: string;
            source: string;
            destination: string;
            description: string;
            priority: number;
        })[];
    };
    FlyAutoScalingConfig: {
        minMachines: number;
        maxMachines: number;
        scaleToZero: false;
        targetCPUUtilization: number;
    };
    RemixSite: {
        sourceDir: string;
        buildCommand: string;
        startCommand: string;
        nodeVersion: string;
        port: number;
    };
};
