import { DefaultAzureCredential } from "@azure/identity";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { StorageManagementClient } from "@azure/arm-storage";

export const getStorageAccounts = async (): Promise<string[]> => {
  const credential = new DefaultAzureCredential();
  const subscriptionClient = new SubscriptionClient(credential);
  const storageAccounts: string[] = [];

  for await (const subscription of subscriptionClient.subscriptions.list()) {
    const storageClient = new StorageManagementClient(credential, subscription.subscriptionId);
    for await (const storageAccount of storageClient.storageAccounts.list()) {
      storageAccounts.push(storageAccount.name);
    }
  }

  return storageAccounts;
};
