import * as cdk from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";

export class DynamoDbStack extends cdk.Stack {
  readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, "metal-tracker-dynamodb", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      tableName: "metal-tracker-table",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });
  }
}
