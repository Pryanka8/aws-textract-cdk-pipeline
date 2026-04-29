import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event: any) => {
  try {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
    });

    const response = await textract.send(command);

    const text = response.Blocks?.filter((b) => b.BlockType === "LINE")
      .map((b) => b.Text)
      .join("\n");

    console.log("Extracted Text:", text);

    return text;
  } catch (err) {
    console.log("Error:", err);
    throw err;
  }
};
