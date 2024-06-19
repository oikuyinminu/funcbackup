import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { app, InvocationContext, Timer } from "@azure/functions";
import { getStorageAccounts } from "../services/StorageProcessor.js";

const getBlobServiceClient = (storageAccountName: string, credential: ManagedIdentityCredential): BlobServiceClient => {
  return new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    credential
  );
};

const processStorageAccountSnapshots = async (myTimer: Timer, context: InvocationContext): Promise<void> => {
  const storageAccounts = await getStorageAccounts();
  const credential = new ManagedIdentityCredential();

  for (const storageAccountName of storageAccounts) {
    context.log(`Processing snapshots for storage account ${storageAccountName}`);
    try {
      const blobServiceClient = getBlobServiceClient(storageAccountName, credential);
      const containers = blobServiceClient.listContainers();

      for await (const container of containers) {
        context.log(`Creating snapshots for blobs in container: ${container.name}`);
        const containerClient = blobServiceClient.getContainerClient(container.name);
        const blobs = containerClient.listBlobsFlat();

        for await (const blob of blobs) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const blockBlobClient = blobClient.getBlockBlobClient();

          // Create snapshot
          const snapshotResponse = await blockBlobClient.createSnapshot();
          context.log(`Created snapshot for blob: ${blob.name} at ${snapshotResponse.snapshot}`);
        }
      }
    } catch (error) {
      context.error(`Error processing storage account: ${storageAccountName}`);
      context.error(error.message);
    }
  }
};
 
app.timer('PerformBlobSnapShot', {
  schedule: '*/5 * * * *', // Every Friday at midnight
  handler: (myTimer: Timer, context: InvocationContext) => processStorageAccountSnapshots(myTimer, context),
});
