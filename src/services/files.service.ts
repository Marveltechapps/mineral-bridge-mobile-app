import { api, UPLOAD_TIMEOUT_MS } from '../api';
import type { FilePurpose, FileUrl, UploadedFile } from '../api';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function extOf(uri: string): string {
  const clean = uri.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

export interface UploadOptions {
  mime?: string;
  /** File name sent to the server; defaults to the last URI segment. */
  fileName?: string;
  signal?: AbortSignal;
}

/**
 * POST /files (multipart: `file` + `purpose`). Returns the stored file (`fileId` is what other endpoints take).
 * `uri` is a local `file://` / `content://` URI (e.g. from react-native-image-picker).
 */
export function uploadFile(uri: string, purpose: FilePurpose, mime?: string, options: UploadOptions = {}): Promise<UploadedFile> {
  const ext = extOf(uri);
  const type = mime ?? options.mime ?? MIME_BY_EXT[ext] ?? 'application/octet-stream';
  const lastSegment = decodeURIComponent(uri.split('?')[0].split('/').pop() || `upload.${ext || 'bin'}`);
  const name = options.fileName ?? lastSegment;

  const form = new FormData();
  form.append('purpose', purpose);
  // React Native's FormData accepts `{ uri, name, type }` file descriptors.
  form.append('file', { uri, name, type } as unknown as Blob);

  return api.post<UploadedFile>('/files', form, { timeoutMs: UPLOAD_TIMEOUT_MS, signal: options.signal });
}

/** GET /files/:fileId/url - short-lived signed URL (2 min for KYC, 15 min otherwise). */
export const getFileUrl = (fileId: string, signal?: AbortSignal): Promise<FileUrl> =>
  api.get<FileUrl>(`/files/${encodeURIComponent(fileId)}/url`, { signal });
