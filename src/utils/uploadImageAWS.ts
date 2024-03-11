import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadImageAWS = (imageBase64Data: string, mindmapId: any) => {
  const buffer = Buffer.from(imageBase64Data.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const params = {
    Bucket: "mydeck",
    Key: `${mindmapId}.png`, // Assuming mindmapId is available in this scope
    Body: buffer,
    ContentType: "image/png",
    ACL: "public-read", // Make the image publicly accessible
  };

  s3.upload(params, function (err: any, data: { Location: any }) {
    if (err) {
      console.log("Error uploading data: ", err);
    } else {
      console.log("Successfully uploaded data to mydeck/", data.Location);
    }
  });
};
