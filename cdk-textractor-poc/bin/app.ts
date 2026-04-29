import * as cdk from "aws-cdk-lib";
import { TextractStack } from "../lib/textract-stack";

const app = new cdk.App();
new TextractStack(app, "TextractStack");
cdk.Tags.of(app).add("Project", "TextractorPoc");
