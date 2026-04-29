import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";

export class TextractStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const bucket = new s3.Bucket(this, "DocumentBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda Function
    const textractLambda = new lambda.Function(this, "TextractLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "textract-handler.handler",
      code: lambda.Code.fromAsset("lambda"),
      timeout: cdk.Duration.seconds(30),
    });

    // Permissions for Textract
    textractLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:DetectDocumentText", "textract:AnalyzeDocument"],
        resources: ["*"],
      }),
    );

    // Allow S3 to trigger Lambda
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(textractLambda),
    );
  }
}
