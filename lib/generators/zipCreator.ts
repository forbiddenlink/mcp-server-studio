import JSZip from 'jszip';

export interface ExportFile {
  name: string;
  content: string;
}

export async function createZipBlob(files: ExportFile[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.content);
  }

  return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}
