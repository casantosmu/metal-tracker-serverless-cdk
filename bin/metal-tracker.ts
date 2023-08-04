#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/dynamodb-stack.ts";

const app = new cdk.App();

new DynamoDbStack(app, "dynamoDbStack");
