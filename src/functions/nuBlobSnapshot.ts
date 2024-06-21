import { app, InvocationContext, Timer } from "@azure/functions";
import * as blobService from "../services/StorageProcessor.js";

export async function nuBlobSnapshot(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
  

  // Process storage account snapshots
  await blobService.processStorageAccountSnapshots(context);
}

app.timer('nuBlobSnapshot', {
    schedule: '0 0 0 * * 5', // Runs every Friday 12.00am
    handler: nuBlobSnapshot
});
