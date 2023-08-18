import { EventBridgeHandler } from "aws-lambda";
import { lambdaRequestTracker } from "pino-lambda";
import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { logger } from "../utils/logger";
import { getPosts } from "../http/getPosts";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const loggerWithRequest = lambdaRequestTracker();

export const handler: EventBridgeHandler<string, unknown, unknown> = async (
  event,
  context
) => {
  loggerWithRequest(event, context);

  const posts = await getPosts();

  const putPromises = posts.map(
    async ({ blogName, id, date, link, title, summary }) => {
      const command = new PutCommand({
        TableName: process.env.METAL_TRACKER_TABLE_NAME,
        Item: {
          PK: blogName,
          SK: id.toString(),
          date,
          link,
          title,
          summary,
        },
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      });

      try {
        const result = await docClient.send(command);
        logger.info({ result }, "DynamoDB put command");
      } catch (error) {
        // Post already saved
        if (error instanceof ConditionalCheckFailedException) {
          return;
        }

        throw error;
      }
    }
  );

  await Promise.all(putPromises);
};
