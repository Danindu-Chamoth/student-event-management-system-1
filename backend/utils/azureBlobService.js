const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "user";

let containerClient = null;

/**
 * Get or create the Azure Blob container client (lazy singleton)
 */
const getContainerClient = () => {
  if (!containerClient) {
    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set in environment variables.");
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
  }
  return containerClient;
};

/**
 * Upload a file buffer to Azure Blob Storage
 * @param {Buffer} fileBuffer - The file data as a Buffer
 * @param {string} fileName - The desired blob name (e.g., "1234-avatar.jpg")
 * @param {string} mimeType - The MIME type (e.g., "image/jpeg")
 * @returns {Promise<string>} The public URL of the uploaded blob
 */
const uploadToAzure = async (fileBuffer, fileName, mimeType) => {
  const container = getContainerClient();

  // Ensure the container exists (creates it if not, with public blob access)
  await container.createIfNotExists({ access: "blob" });

  const blockBlobClient = container.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url;
};

/**
 * Delete a blob from Azure Blob Storage by its full URL
 * @param {string} blobUrl - The full URL of the blob to delete
 * @returns {Promise<boolean>} true if deleted, false if not found or not an Azure URL
 */
const deleteFromAzure = async (blobUrl) => {
  if (!blobUrl || !blobUrl.includes("blob.core.windows.net")) {
    return false; // Not an Azure URL, skip
  }

  try {
    const container = getContainerClient();
    // Extract the blob name from the URL (everything after the container name)
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split("/");
    // pathname format: /containerName/blobName
    const blobName = pathParts.slice(2).join("/");

    if (!blobName) return false;

    const blockBlobClient = container.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    return true;
  } catch (error) {
    console.error("Error deleting blob from Azure:", error.message);
    return false;
  }
};

module.exports = { uploadToAzure, deleteFromAzure };
