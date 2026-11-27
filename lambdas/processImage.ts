import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { SQSHandler } from "aws-lambda";

const s3 = new S3Client({});

type S3Notification = {
  Records?: Array<{
    s3: {
      bucket: { name: string };
      object: { key: string };
    };
  }>;
};

export const handler: SQSHandler = async (event) => {
  console.log("Event", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body) as S3Notification;
    if (!recordBody.Records) {
      continue;
    }

    console.log("Record body", JSON.stringify(recordBody));

    for (const messageRecord of recordBody.Records) {
      const { bucket, object } = messageRecord.s3;
      const srcKey = decodeURIComponent(object.key.replace(/\+/g, " "));

      await s3.send(
        new GetObjectCommand({
          Bucket: bucket.name,
          Key: srcKey,
        })
      );
    }
  }
};
