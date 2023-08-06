import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_lambda_event_sources as eventsources,
  aws_dynamodb as dynamodb,
  aws_logs as logs,
  aws_lambda_nodejs as nodejs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

type SendMailLambdaStackProps = {
  table: dynamodb.Table;
} & cdk.StackProps;

export class SendMailLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SendMailLambdaStackProps) {
    super(scope, id, props);

    const fn = new nodejs.NodejsFunction(this, "send-email-lambda", {
      entry: path.join("src", "lambda", "sendmail-lambda.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      logRetention: logs.RetentionDays.TWO_WEEKS,
    });

    fn.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        filters: [
          lambda.FilterCriteria.filter({
            eventName: lambda.FilterRule.isEqual("INSERT"),
          }),
        ],
      })
    );
  }
}
