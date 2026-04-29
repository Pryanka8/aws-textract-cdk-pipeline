import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
export class TextractStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // S3 Bucket
    const bucket = new s3.Bucket(this, "DocumentBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda Function
    const textractLambda = new lambdaNodejs.NodejsFunction(
      this,
      "TextractLambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        entry: path.join(__dirname, "../lambda/textract-handler.ts"),
        handler: "handler",
        bundling: {
          externalModules: [], // ensures no docker fallback
        },
      },
    );

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
