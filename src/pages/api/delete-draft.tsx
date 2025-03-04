import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

// 下書き削除API
export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "DELETE") {
        try {
            const { draftFilePath } = req.body;

            if (!draftFilePath) {
                return res.status(400).json({ error: "Missing draftFilePath parameter" });
            }

            const draftsDir = path.join(process.cwd(), "drafts");

            if (!draftFilePath.startsWith(draftsDir)) {
                return res.status(400).json({ error: "Invalid file path" });
            }

            if (!fs.existsSync(draftFilePath)) {
                return res.status(404).json({ error: "Draft not found" });
            }

            fs.unlinkSync(draftFilePath);

            res.status(200).json({ message: "Draft deleted successfully" });
        } catch (error) {
            console.error("Failed to delete draft:", error);
            res.status(500).json({ error: "Failed to delete draft" });
        }
    } else {
        res.status(405).json({ error: `Method not allowed [${req.method}]` });
    }
};
