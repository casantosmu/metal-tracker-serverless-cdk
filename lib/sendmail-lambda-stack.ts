import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_lambda_event_sources as eventsources,
  aws_dynamodb as dynamodb,
  aws_logs as logs,
  aws_lambda_nodejs as nodejs,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
  aws_cloudwatch as cloudwatch,
  aws_cloudwatch_actions as actions,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

type SendMailLambdaStackProps = {
  table: dynamodb.Table;
  sendMailTopic: sns.Topic;
} & cdk.StackProps;

export class SendMailLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SendMailLambdaStackProps) {
    super(scope, id, props);

    const lambdaFn = new nodejs.NodejsFunction(this, "send-mail-lambda", {
      entry: path.join("src", "lambda", "sendmail-lambda.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        SEND_MAIL_TOPIC_ARN: props.sendMailTopic.topicArn,
      },
    });

    lambdaFn.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 1,
        retryAttempts: 3,
        filters: [
          lambda.FilterCriteria.filter({
            eventName: lambda.FilterRule.isEqual("INSERT"),
          }),
        ],
      }),
    );

    props.sendMailTopic.grantPublish(lambdaFn);

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
