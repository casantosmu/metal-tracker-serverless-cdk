import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_logs as logs,
  aws_lambda_nodejs as nodejs,
  aws_dynamodb as dynamodb,
  aws_events as event,
  aws_events_targets as target,
  aws_cloudwatch as cloudwatch,
  aws_sns as sns,
  aws_cloudwatch_actions as actions,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

type TrackerLambdaStackProps = {
  table: dynamodb.Table;
  sendMailTopic: sns.Topic;
} & cdk.StackProps;

const fetchRate = 3;

export class TrackerLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TrackerLambdaStackProps) {
    super(scope, id, props);

    const lambdaFn = new nodejs.NodejsFunction(this, "tracker-lambda", {
      entry: path.join("src", "lambda", "tracker-lambda.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(5),
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        METAL_TRACKER_TABLE_NAME: props.table.tableName,
        FETCH_POST_IN_THE_LAST_DAYS: fetchRate.toString(),
      },
    });

    new event.Rule(this, "tracker-schedule", {
      schedule: event.Schedule.rate(cdk.Duration.days(fetchRate)),
      targets: [new target.LambdaFunction(lambdaFn)],
    });

    props.table.grantReadWriteData(lambdaFn);

    const metricErrorsAlarm = new cloudwatch.Alarm(
      this,
      "metric-errors-alarm",
      {
        metric: lambdaFn.metricErrors(),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator:
          cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    );

    metricErrorsAlarm.addAlarmAction(
      new actions.SnsAction(props.sendMailTopic),
    );
  }
}
