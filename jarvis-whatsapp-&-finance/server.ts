import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./src/lib/firebaseAdmin.ts";
import { startWhatsApp, qrCodeData, isConnected } from "./src/services/whatsapp.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/status", (req, res) => {
    res.json({ isConnected, qrCode: qrCodeData });
  });

  app.get("/api/dashboard", async (req, res) => {
    try {
      const financesSnapshot = await db.collection("finances").orderBy("date", "desc").limit(50).get();
      const finances = financesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const allFinances = await db.collection("finances").get();
      let income = 0;
      let outcome = 0;
      allFinances.forEach(doc => {
        const d = doc.data();
        if (d.type === 'entrada') income += d.amount;
        else outcome += d.amount;
      });

      const goalsSnapshot = await db.collection("goals").get();
      const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const tasksSnapshot = await db.collection("tasks").where("status", "==", "todo").get();
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const remindersSnapshot = await db.collection("reminders").where("status", "==", "pending").get();
      const reminders = remindersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({ 
        finances, 
        stats: { 
          balance: income - outcome,
          income,
          outcome
        },
        goals,
        tasks,
        reminders
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Firebase mismatch" });
    }
  });

  // Iniciar Bot do WhatsApp
  startWhatsApp().catch(err => console.error("Falha ao iniciar WhatsApp:", err));

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jarvis Server rodando em http://localhost:${PORT}`);
  });
}

startServer();
