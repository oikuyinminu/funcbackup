import { app, InvocationContext, Timer } from "@azure/functions";

export async function nuBlobSnapshot(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
}

app.timer('nuBlobSnapshot', {
    schedule: '0 */5 * * * *',
    handler: nuBlobSnapshot,
    runOnStartup: true
});
