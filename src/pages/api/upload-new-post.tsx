import fs from "fs";
import path from "path";
import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const uploadDir = path.join(process.cwd(), "posts");
    const timeStampString = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "_");
    const fileName = timeStampString + "_" + crypto.randomUUID() + ".md"; //fileName timeStamp_UUID.md
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        return fileName; // Will be joined with options.uploadDir.
      },
    });
    console.log(form);
    let fields;
    let files;

    try {
      [fields, files] = await form.parse(req);
    } catch (err) {
      //Todo: Error handling
      console.log(err); //Debug
      res.status(500).json({ error: `Failed to upload file` });
      return;
    }

    res.status(200).json({ message: "File uploaded successfully" });
  } else {
    res.status(405).json({ error: `Method not allowed [${req.method}]` });
  }
};


