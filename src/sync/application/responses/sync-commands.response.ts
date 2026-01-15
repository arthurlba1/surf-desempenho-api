export class SyncCommandsResponse {
  processed: string[]; // commandIds
  failed: Array<{ commandId: string; error: string }>;
  conflicts: Array<{
    commandId: string;
    field: string;
    clientVersion: number;
    serverVersion: number;
  }>;
  serverTime: string;
}
