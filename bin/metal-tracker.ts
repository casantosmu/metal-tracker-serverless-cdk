#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/dynamodb-stack";
import { SendMailLambdaStack } from "../lib/sendmail-lambda-stack";
import { TrackerLambdaStack } from "../lib/tracker-lambda-stack";

const app = new cdk.App();

const dynamoDbStack = new DynamoDbStack(app, "dynamo-db-stack");

new SendMailLambdaStack(app, "sendmail-lambda-stack", {
  table: dynamoDbStack.table,
});

new TrackerLambdaStack(app, "tracker-lambda-stack", {
  table: dynamoDbStack.table,
});
