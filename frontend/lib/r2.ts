import { S3Client } from "@aws-sdk/client-s3";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getR2Endpoint() {
  if (process.env.R2_ENDPOINT) {
    return process.env.R2_ENDPOINT;
  }

  return `https://${getRequiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`;
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: getR2Endpoint(),
  forcePathStyle: true,
  credentials: {
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
  },
});

export const R2_BUCKET_NAME = getRequiredEnv("R2_BUCKET_NAME");
