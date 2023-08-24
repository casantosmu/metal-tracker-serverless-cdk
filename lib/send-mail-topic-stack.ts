import * as cdk from "aws-cdk-lib";
import {
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
  aws_ssm as ssm,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class SendMailTopicStack extends cdk.Stack {
  readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.topic = new sns.Topic(this, "send-mail-topic-stack");

    const emailAddress = ssm.StringParameter.valueForStringParameter(
      this,
      "SendEmailAddress",
    );

    this.topic.addSubscription(
      new subscriptions.EmailSubscription(emailAddress),
    );
  }
}
