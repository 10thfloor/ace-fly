export declare class Logger {
    static log(message: string, level?: "info" | "warn" | "error"): void;
    static info(message: string): void;
    static warn(message: string): void;
    static error(message: string): void;
}
