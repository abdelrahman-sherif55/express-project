import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import getFolderSize from '../utils/get-folder-size.util';
import ApiErrors from '../utils/api-errors.util';
import {HttpStatusCode} from '../enums/status-code.enum';

const checkFolderSize = (folderPath: string, maxSizeGB: number) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.file || req.files) {
      await fs.mkdir(folderPath, {recursive: true});
      const maxSizeBytes: number = maxSizeGB * 1024 * 1024 * 1024;
      const folderSize = await getFolderSize(folderPath);

      if ((folderSize as number) >= maxSizeBytes) {
        return next(
          new ApiErrors(
            `${req.__('max_size', {size: maxSizeGB.toString()})}`,
            HttpStatusCode.CONTENT_TOO_LARGE,
          ),
        );
      }
    }
    next();
  });

export default checkFolderSize;
