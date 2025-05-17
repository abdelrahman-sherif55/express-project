import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const getFolderSizeFallback = async (folderPath: string) => {
  let totalSize: number = 0;
  const entries = await fs.readdir(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath: string = path.join(folderPath, entry.name);

    if (entry.isFile()) {
      const stats = await fs.stat(fullPath);
      totalSize += stats.size;
    } else if (entry.isDirectory()) {
      totalSize += await getFolderSizeFallback(fullPath);
    }
  }

  return totalSize;
};

const getFolderSize = async (folderPath: string) =>
  new Promise((resolve, reject) => {
    const isMac: boolean = os.platform() === 'darwin';
    const cmd: string = isMac
      ? `du -sk "${folderPath}" | awk '{print $1 * 1024}'`
      : `du -sb "${folderPath}"`;
    exec(cmd, async (err, stdout) => {
      if (err || !stdout) {
        try {
          const fallback = await getFolderSizeFallback(folderPath);
          return resolve(fallback);
        } catch (fallbackErr) {
          return reject(fallbackErr);
        }
      }

      const size: number = parseInt(stdout.trim().split(/\s+/)[0], 10);
      resolve(size);
    });
  });

export default getFolderSize;
