import { Handler, DynamoDBStreamHandler } from "aws-lambda";
import { lambdaRequestTracker } from "pino-lambda";
import { logger } from "../utils/logger/logger";

const withRequest = lambdaRequestTracker();

export const handler: DynamoDBStreamHandler = async (event, context) => {
  withRequest(event, context);

  logger.info(event, "events :>> ");
};
