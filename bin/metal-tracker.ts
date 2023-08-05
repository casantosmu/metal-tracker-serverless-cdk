#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/dynamodb-stack";
import { SendMailLambdaStack } from "../lib/sendmail-lambda-stack";

const app = new cdk.App();

const dynamoDbStack = new DynamoDbStack(app, "dynamo-db-stack");

new SendMailLambdaStack(app, "sendmail-lambda-stack", {
  table: dynamoDbStack.table,
});
