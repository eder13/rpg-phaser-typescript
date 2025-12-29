import chalk from 'chalk';

class Logger {
    static info(message: string) {
        console.log(`${chalk.blue('[INFO]')} ${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
    }

    static warn(message: string) {
        console.warn(`${chalk.yellow('[WARN]')} ${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
    }

    static error(message: string) {
        console.error(`${chalk.red('[ERROR]')} ${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
    }

    static success(message: string) {
        console.log(`${chalk.green('[SUCCESS]')} ${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
    }

    static debug(message: string) {
        console.debug(`${chalk.magenta('[DEBUG]')} ${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
    }
}

export default Logger;
