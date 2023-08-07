import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_logs as logs,
  aws_lambda_nodejs as nodejs,
  aws_dynamodb as dynamodb,
  aws_events as event,
  aws_events_targets as target,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

type TrackerLambdaStackProps = {
  table: dynamodb.Table;
} & cdk.StackProps;

export class TrackerLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TrackerLambdaStackProps) {
    super(scope, id, props);

    const lambdaFn = new nodejs.NodejsFunction(this, "tracker-lambda", {
      entry: path.join("src", "lambda", "tracker-lambda.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        METAL_TRACKER_TABLE_NAME: props.table.tableName,
      },
    });

    new event.Rule(this, "tracker-schedule", {
      schedule: event.Schedule.rate(cdk.Duration.days(1)),
      targets: [new target.LambdaFunction(lambdaFn)],
    });

    props.table.grantReadWriteData(lambdaFn);
  }
}
