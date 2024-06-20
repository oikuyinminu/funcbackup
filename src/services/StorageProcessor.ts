import { ManagedIdentityCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { InvocationContext } from "@azure/functions";
import * as settings from "./SettingsProvider";

const getBlobServiceClient = (storageAccountName: string, credential: ManagedIdentityCredential): BlobServiceClient => {
  return new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    credential
  );
};

export const processStorageAccountSnapshots = async (context: InvocationContext): Promise<void> => {
  const storageAccounts: string[] = [
    settings.CONTENT_STORAGES,
  ]
    .filter(storage => storage !== "")
    .map(storage => storage.trim().split(","))
    .reduce((acc, val) => acc.concat(val), []);

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
          context.log(`Processed blob: ${blob.name}`);
          const blockBlobClient = blobClient.getBlockBlobClient();

          // Create snapshot (if supported)
          try {
            const snapshotResponse = await blockBlobClient.createSnapshot();
            context.log(`Created snapshot for blob: ${blob.name} at ${snapshotResponse.snapshot}`);
          } catch (error) {
            context.error(`Error creating snapshot for blob: ${blob.name}`);
            context.error(error.message);
          }
        }
      }
    } catch (error) {
      context.error(`Error processing storage account: ${storageAccountName}`);
      context.error(error.message);
    }
  }

  context.log('Blob processing completed.');
};
