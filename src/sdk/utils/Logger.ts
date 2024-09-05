export class Logger {
  static log(message: string, level: "info" | "warn" | "error" = "info"): void {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  static info(message: string): void {
    this.log(message, "info");
  }

  static warn(message: string): void {
    this.log(message, "warn");
  }

  static error(message: string): void {
    this.log(message, "error");
  }
}
