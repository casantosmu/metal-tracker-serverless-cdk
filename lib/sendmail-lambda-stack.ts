import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_lambda_event_sources as eventsources,
  aws_dynamodb as dynamodb,
  aws_logs as logs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";

type SendMailLambdaStackProps = {
  table: dynamodb.Table;
} & cdk.StackProps;

export class SendMailLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SendMailLambdaStackProps) {
    super(scope, id, props);

    const pinoLayer = new lambda.LayerVersion(this, "pino-layer", {
      code: lambda.Code.fromAsset("src/layers/pino"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const loggerLayer = new lambda.LayerVersion(this, "logger-layer", {
      code: lambda.Code.fromAsset("src/utils/logger"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fn = new lambda.Function(this, "send-email-lambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sendmail-lambda.handler",
      code: lambda.Code.fromAsset(path.join("src", "lambda")),
      logRetention: logs.RetentionDays.TWO_WEEKS,
      layers: [loggerLayer, pinoLayer],
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
