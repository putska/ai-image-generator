const { app } = require("@azure/functions");

const generateSASToken = require("../../lib/generateSASToken");

const { BlobServiceClient } = require("@azure/storage-blob");

const accountName = process.env.accountName;

const containerName = "images";

app.http("deleteImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const { fileName } = await request.json(); // Assuming you send the file name in the request

    console.log(`Deleting image with file name: ${fileName}`);

    sasToken = await generateSASToken();
    console.log(sasToken);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sasToken}`
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
      await blockBlobClient.delete();
      console.log("File deleted successfully!");
      return { status: 200, body: "Successfully Deleted Image" };
    } catch (error) {
      console.error("Error deleting file:", error.message);
      return { status: 500, body: "Error Deleting Image " + error.message };
    }
  },
});
