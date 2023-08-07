import * as cdk from "aws-cdk-lib";
import {
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
} from "aws-cdk-lib";
import { Construct } from "constructs";

const getEmailAddressMetricErrorsEnv = () => {
  const emailAddressMetricErrorsEnv = process.env.EMAIL_ADDRESS_METRIC_ERRORS;

  if (emailAddressMetricErrorsEnv === undefined) {
    throw Error("'EMAIL_ADDRESS_METRIC_ERRORS' env must be provided");
  }

  return emailAddressMetricErrorsEnv;
};

export class SendMetricErrorsTopicStack extends cdk.Stack {
  readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.topic = new sns.Topic(this, "send-metric-errors-topic-stack");

    this.topic.addSubscription(
      new subscriptions.EmailSubscription(getEmailAddressMetricErrorsEnv())
    );
  }
}
