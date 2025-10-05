import { beforeEach, describe, expect, it, vi } from 'vitest';

import { message } from '@/components/AntdStaticMethods';
import { HERMES_CHAT_CLOUD } from '@/const/branding';
import { fileService } from '@/services/file';
import { uploadService } from '@/services/upload';
import { useFileStore } from '@/store/file';
import { getImageDimensions } from '@/utils/client/imageDimensions';

vi.mock('zustand/traditional');

vi.mock('i18next', () => ({
  t: vi.fn((_key: string, options?: { cloud?: string }) => `cloud:${options?.cloud ?? ''}`),
}));

vi.mock('@/components/AntdStaticMethods', () => ({
  message: {
    info: vi.fn(),
  },
}));

vi.mock('@/services/file', () => ({
  fileService: {
    checkFileHash: vi.fn(),
    createFile: vi.fn(),
  },
}));

vi.mock('@/services/upload', () => ({
  uploadService: {
    uploadBase64ToS3: vi.fn(),
    uploadFileToS3: vi.fn(),
  },
}));

vi.mock('@/utils/client/imageDimensions', () => ({
  getImageDimensions: vi.fn(),
}));

describe('FileUploadAction cloud messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getImageDimensions).mockResolvedValue(
      undefined as unknown as { width: number; height: number },
    );
    vi.mocked(fileService.checkFileHash).mockResolvedValue({ isExist: false } as any);
    vi.mocked(uploadService.uploadFileToS3).mockImplementation(async (_file, options) => {
      options?.onNotSupported?.();
      return { success: false } as any;
    });
  });

  it('uses the Hermes cloud constant when upload falls back to the managed service', async () => {
    const file = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
      name: 'brief.pdf',
      size: 1024,
      type: 'application/pdf',
    } as unknown as File;

    await useFileStore.getState().uploadWithProgress({ file });

    expect(message.info).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining(HERMES_CHAT_CLOUD),
      }),
    );
    expect(vi.mocked(uploadService.uploadFileToS3)).toHaveBeenCalled();
  });
});
