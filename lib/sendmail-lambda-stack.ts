import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_lambda_event_sources as eventsources,
  aws_dynamodb as dynamodb,
  aws_logs as logs,
  aws_lambda_nodejs as nodejs,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

const getEmailAddressEnv = () => {
  const emailAddressEnv = process.env.SEND_EMAIL_ADDRESS;

  if (emailAddressEnv === undefined) {
    throw Error("'SEND_EMAIL_ADDRESS' env must be provided");
  }

  return emailAddressEnv;
};

type SendMailLambdaStackProps = {
  table: dynamodb.Table;
} & cdk.StackProps;

export class SendMailLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SendMailLambdaStackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "send-mail-topic");

    topic.addSubscription(
      new subscriptions.EmailSubscription(getEmailAddressEnv())
    );

    const lambdaFn = new nodejs.NodejsFunction(this, "send-mail-lambda", {
      entry: path.join("src", "lambda", "sendmail-lambda.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        SEND_MAIL_TOPIC_ARN: topic.topicArn,
      },
    });

    lambdaFn.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        filters: [
          lambda.FilterCriteria.filter({
            eventName: lambda.FilterRule.isEqual("INSERT"),
          }),
        ],
      })
    );

    topic.grantPublish(lambdaFn);
  }
}
