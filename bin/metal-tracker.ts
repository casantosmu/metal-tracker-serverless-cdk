#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/dynamodb-stack";
import { SendMailLambdaStack } from "../lib/sendmail-lambda-stack";
import { TrackerLambdaStack } from "../lib/tracker-lambda-stack";
import { SendMetricErrorsTopicStack } from "../lib/send-metric-errors-topic-stack";

const app = new cdk.App();

const dynamoDbStack = new DynamoDbStack(app, "dynamo-db-stack");

const sendMetricErrorsTopicStack = new SendMetricErrorsTopicStack(
  app,
  "send-metric-errors-topic-stack"
);

new SendMailLambdaStack(app, "sendmail-lambda-stack", {
  table: dynamoDbStack.table,
  errorsMetricTopic: sendMetricErrorsTopicStack.topic,
});

new TrackerLambdaStack(app, "tracker-lambda-stack", {
  table: dynamoDbStack.table,
  errorsMetricTopic: sendMetricErrorsTopicStack.topic,
});
