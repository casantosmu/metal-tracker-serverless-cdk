import { pino, pinoLambdaDestination } from "/opt/nodejs/pino";

const destination = pinoLambdaDestination();
export const logger = pino(destination);
