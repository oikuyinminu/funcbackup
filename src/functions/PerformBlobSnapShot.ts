import { app, InvocationContext, Timer } from "@azure/functions";
import * as blobService from "../services/StorageProcessor.js";

export async function SetBlobSnapshot(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log('Timer function processed request.');

  // Process storage account snapshots
  await blobService.processStorageAccountSnapshots(context);
}

app.timer('SetBlobSnapshot', {
  schedule: '*/15 * * * *', // To be adjusted as needed
  handler: SetBlobSnapshot,
});