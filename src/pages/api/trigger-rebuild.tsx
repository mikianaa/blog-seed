import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL!;
        const result = await fetch(webhookUrl, { method: "POST" });

        if (result.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: "Failed to trigger rebuild" });
        }
    } else {
        res.status(405).end();
    }
}
