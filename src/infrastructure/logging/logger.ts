export class Logger {
  info(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }

  warn(message: string): void {
    console.warn(message);
  }

  debug(message: string): void {
    if (process.env['DEBUG'] === 'true') {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

export const logger = new Logger();
