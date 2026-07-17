import { S3Client } from "@aws-sdk/client-s3";

function getRequiredEnv(name: string, aliases: string[] = []) {
  const names = [name, ...aliases];

  for (const envName of names) {
    const value = process.env[envName];

    if (value) {
      return value;
    }
  }

  throw new Error(`Missing environment variable: ${names.join(" or ")}`);
}

function getOptionalEnv(name: string, aliases: string[] = []) {
  const names = [name, ...aliases];

  for (const envName of names) {
    const value = process.env[envName];

    if (value) {
      return value;
    }
  }

  return "";
}

function getR2Endpoint() {
  const endpoint = getOptionalEnv("R2_ENDPOINT");

  if (endpoint) {
    return endpoint;
  }

  return `https://${getRequiredEnv("R2_ACCOUNT_ID", [
    "CLOUDFLARE_ACCOUNT_ID",
  ])}.r2.cloudflarestorage.com`;
}

export function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: getR2Endpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID", [
        "CLOUDFLARE_R2_ACCESS_KEY_ID",
      ]),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY", [
        "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      ]),
    },
  });
}

export function getR2BucketName() {
  return getRequiredEnv("R2_BUCKET_NAME", ["CLOUDFLARE_R2_BUCKET_NAME"]);
}

export function getR2PublicUrl() {
  return getOptionalEnv("R2_PUBLIC_URL", ["CLOUDFLARE_R2_PUBLIC_URL"]);
}
