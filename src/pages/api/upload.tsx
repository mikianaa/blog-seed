import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req : NextApiRequest, res : NextApiResponse) => {
  if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), 'posts');
    const form = new formidable.IncomingForm({uploadDir: uploadDir, keepExtensions:true});
    form.on('file', (field, file: any) => {//後でファイルの型を定義する。
      const filePath = path.join(process.cwd(), 'posts', file.name);
      fs.renameSync(file.path, filePath);
    });

    form.parse(req, (err: Error) => {
      if (err) {
        res.status(500).json({ error: 'Failed to upload file' });
        return;
      }
      res.status(200).json({ message: 'File uploaded successfully' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
