import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function getS3Data(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    try {
        const response = await s3Client.send(command);
        const data = await response.Body.transformToString();
        return JSON.parse(data);
    } catch (err) {
        console.error("S3 Fetch Error:", err);
        return null;
    }
}

export async function putS3Data(key, data) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
    });

    try {
        await s3Client.send(command);
        return true;
    } catch (err) {
        console.error("S3 Upload Error:", err);
        return false;
    }
}

export default s3Client;