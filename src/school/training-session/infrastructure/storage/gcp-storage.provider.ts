import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

import {
  IStorageProviderPort,
  type StorageUploadInput,
  type StorageUploadResult,
} from '@/school/training-session/domain/ports/storage.provider.port';

@Injectable()
export class GcpStorageProvider implements IStorageProviderPort {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage();
    this.bucketName =
      this.configService.get<string>('GCP_STORAGE_BUCKET_NAME') ??
      '';
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'Storage bucket is not configured. Set GCP_STORAGE_BUCKET_NAME',
      );
    }

    const file = this.storage.bucket(this.bucketName).file(input.key);
    await file.save(input.buffer, {
      resumable: false,
      metadata: {
        contentType: input.contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    const encodedKey = encodeURIComponent(input.key).replace(/%2F/g, '/');
    return {
      key: input.key,
      url: `https://storage.googleapis.com/${this.bucketName}/${encodedKey}`,
    };
  }
}
