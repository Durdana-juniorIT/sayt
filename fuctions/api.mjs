import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(currentDirectory, "..", "dist");
const allowedProjects = new Set([
    "Biznes sayti",
    "Landing page",
    "Onlayn do‘kon",
    "Boshqa loyiha",
]);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number.");
}

app.use(express.json({ limit: "10kb" }));
app.use(express.static(distDirectory));

app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
});

app.get("/", (_request, response) => {
    response.sendFile(path.join(distDirectory, "home.html"));
});

app.post("/api/contact", async (request, response) => {
    const { name, email, project, message } = request.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof project !== "string" ||
        typeof message !== "string"
    ) {
        return response.status(400).json({ error: "Barcha maydonlarni to‘ldiring." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (
        cleanName.length < 2 ||
        cleanName.length > 100 ||
        cleanEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
        !allowedProjects.has(project) ||
        cleanMessage.length < 5 ||
        cleanMessage.length > 2000
    ) {
        return response.status(400).json({ error: "Ma’lumotlarni tekshirib, qayta yuboring." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        return response.status(503).json({
            error: "Telegram bot sozlanmagan. Sayt egasi bot tokeni va chat ID ni sozlashi kerak.",
        });
    }

    const text = [
        "Yangi sayt loyihasi so‘rovi",
        "",
        `Ism: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Sayt turi: ${project}`,
        "",
        "Loyiha haqida:",
        cleanMessage,
    ].join("\n");

    try {
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text }),
                signal: AbortSignal.timeout(10000),
            },
        );
        const result = await telegramResponse.json();

        if (!telegramResponse.ok || result.ok !== true) {
            console.error(`Telegram rejected a contact request (HTTP ${telegramResponse.status}).`);
            return response.status(502).json({
                error: "Telegramga yuborilmadi. Bot sozlamalarini tekshirib, qayta urinib ko‘ring.",
            });
        }

        return response.json({ message: "So‘rovingiz muvaffaqiyatli yuborildi." });
    } catch (error) {
        console.error("Telegramga so‘rov yuborishda xatolik:", error.message);
        return response.status(502).json({
            error: "Telegram bilan bog‘lanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.",
        });
    }
});

app.use((error, _request, response, _next) => {
    if (error.type === "entity.parse.failed") {
        return response.status(400).json({ error: "So‘rov formati noto‘g‘ri." });
    }
    if (error.type === "entity.too.large") {
        return response.status(413).json({ error: "Yuborilgan ma’lumot hajmi juda katta." });
    }

    console.error("API xatosi:", error.message);
    return response.status(500).json({ error: "Serverda xatolik yuz berdi." });
});

app.listen(port, () => {
    console.log(`Sayt http://localhost:${port} manzilida ishga tushdi.`);
});