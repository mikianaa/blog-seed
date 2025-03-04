import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextApiRequest, NextApiResponse } from "next";


//下書き取得API
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const draftsDir = path.join(process.cwd(), "drafts");

      if (!fs.existsSync(draftsDir)) {
        res.status(200).json({ drafts: [] });
        return;
      }

      const files = fs.readdirSync(draftsDir);
      const drafts = files.map((file) => {
        const filePath = path.join(draftsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        return {
          title: data.title || "Untitled",
          image: data.image || 'seed-default.png',
          content: content || "",
          category: data.categories?.[0] || "Uncategorized",
          draftFilePath: filePath
        };
      });

      res.status(200).json({ drafts });
    } catch (error) {
      console.error("Failed to read drafts:", error);
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  } else {
    res.status(405).json({ error: `Method not allowed [${req.method}]` });
  }
};
