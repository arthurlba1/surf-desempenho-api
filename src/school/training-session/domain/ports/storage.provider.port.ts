export type StorageUploadInput = {
  key: string;
  buffer: Buffer;
  contentType: string;
};

export type StorageUploadResult = {
  key: string;
  url: string;
};

export abstract class IStorageProviderPort {
  abstract upload(input: StorageUploadInput): Promise<StorageUploadResult>;
}
