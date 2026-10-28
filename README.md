# Sayt Yaratish

Sayt Node.js va Express yordamida ishlaydi. Lokal ishga tushirish:

```powershell
npm install
npm start
```

Sayt `http://localhost:3000` manzilida ochiladi.

## Render’da deploy qilish

1. Loyihani GitHub repository’ga push qiling.
2. Render’da **New > Blueprint** ni tanlab, repository’ni ulang. Render `render.yaml` dagi sozlamalarni o‘qiydi.
3. Deploy vaqtida `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` environment variable’larini Render’da kiriting. Ularni GitHub’ga yoki kod ichiga qo‘shmang.
4. Deploy tugagach, Render bergan sayt manzilini ochib, kontakt formasini sinang.

Telegram bot tokenini BotFather’dan oling. `TELEGRAM_CHAT_ID` — so‘rovlar borishi kerak bo‘lgan chat yoki guruh ID’si. Bot guruhga qo‘shilgan bo‘lsa, botga xabar yuborish ruxsati borligini tekshiring.
