import { DynamoDBStreamHandler } from "aws-lambda";
import { lambdaRequestTracker } from "pino-lambda";
import { logger } from "../utils/logger";
import AWS from "aws-sdk";
import { z } from "zod";
import {
  removeControlCharacters,
  getAsciiCharacters,
  truncateString,
} from "../utils/string";

const sns = new AWS.SNS();

const snsSubjectMaxLong = 100;

const metalTrackerTableEventRecordSchema = z.object({
  dynamodb: z.object({
    NewImage: z.object({
      date: z.object({ S: z.string() }),
      link: z.object({ S: z.string() }),
      title: z.object({ S: z.string() }),
      summary: z.object({ S: z.string() }),
    }),
    Keys: z.object({
      PK: z.object({
        S: z.string(),
      }),
    }),
  }),
});

const loggerWithRequest = lambdaRequestTracker();

export const handler: DynamoDBStreamHandler = async (event, context) => {
  loggerWithRequest(event, context);

  const publishPromises = event.Records.map(async (record) => {
    const data = metalTrackerTableEventRecordSchema.parse(record);

    const blogName = data.dynamodb.Keys.PK.S;

    const {
      date: { S: date },
      link: { S: link },
      summary: { S: summary },
      title: { S: title },
    } = data.dynamodb.NewImage;

    let emailSubject = `Metal Tracker - New album review: ${title}`;
    emailSubject = removeControlCharacters(emailSubject);
    emailSubject = getAsciiCharacters(emailSubject);
    emailSubject = truncateString(emailSubject, snsSubjectMaxLong);

    const emailMessage = `A new album review has been published on ${blogName}\n\nTitle: ${title}\nDate: ${date}\nSummary: ${summary}\nLink: ${link}`;

    const params = {
      Subject: emailSubject,
      Message: emailMessage,
      TopicArn: process.env.SEND_MAIL_TOPIC_ARN,
    };

    const result = await sns.publish(params).promise();
    logger.info({ result }, "Message sent successfully");
  });

  await Promise.all(publishPromises);
};
