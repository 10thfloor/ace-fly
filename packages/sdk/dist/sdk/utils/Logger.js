export class Logger {
    static log(message, level = "info") {
        const timestamp = new Date().toISOString();
        console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
    static info(message) {
        this.log(message, "info");
    }
    static warn(message) {
        this.log(message, "warn");
    }
    static error(message) {
        this.log(message, "error");
    }
}
