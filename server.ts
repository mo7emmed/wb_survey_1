import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Telegram Notification Endpoint
  app.post("/api/notify", async (req, res) => {
    // Check for both uppercase and lowercase versions of the keys
    const tgToken = process.env.TG_TOKEN || process.env.tg_token;
    const groupId = process.env.GROUP_ID || process.env.group_id;

    if (!tgToken || !groupId) {
      console.error("Telegram credentials missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    try {
      const message = "أكمل أحد المستخدمين الاستبيان";
      const url = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: groupId,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API error:", errorData);
        return res.status(502).json({ error: "Failed to send Telegram notification" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
