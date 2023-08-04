import * as cdk from "aws-cdk-lib";
import {
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_lambda_event_sources as eventsources,
} from "aws-cdk-lib";
import { Construct } from "constructs";

const awsLambdaOutput = `
    exports.handler = function(event, context, callback) {
        console.log(JSON.stringify(event, null, 2));
        event.Records.forEach(function(record) {
            console.log(record.eventID);
            console.log(record.eventName);
            console.log('DynamoDB Record: %j', record.dynamodb);
        });
        callback(null, "message");
    };
`;

export class DynamoDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "metal-tracker-dynamodb", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      tableName: "metal-tracker-table",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    const fn = new lambda.Function(this, "send-email-lambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      //   code: lambda.Code.fromAsset(path.join(__dirname, "lambda-handler")),
      code: lambda.Code.fromInline(awsLambdaOutput),
    });

    fn.addEventSource(
      new eventsources.DynamoEventSource(table, {
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
