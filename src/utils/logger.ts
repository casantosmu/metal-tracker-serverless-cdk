import { pino } from "pino";
import { pinoLambdaDestination } from "pino-lambda";

const destination = pinoLambdaDestination();
export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
  },
  destination
);
