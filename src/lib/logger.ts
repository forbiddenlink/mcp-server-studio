import { Logger } from 'next-axiom';

export const log = new Logger();
export const createLogger = (source: string) => log.with({ source });
