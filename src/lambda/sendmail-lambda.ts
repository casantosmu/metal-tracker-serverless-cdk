import { Handler, DynamoDBStreamHandler } from "aws-lambda";
import { lambdaRequestTracker } from "/opt/nodejs/pino";
import { logger } from "/opt/nodejs/logger";

const withRequest = lambdaRequestTracker();

export const handler: DynamoDBStreamHandler = async (event, context) => {
  withRequest(event, context);

  logger.info(event, "events :>> ");
};
