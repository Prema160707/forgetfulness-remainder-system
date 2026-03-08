import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mindguard.db");

// Initialize database
console.log("Initializing database...");
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT,
      settings TEXT DEFAULT '{"alarmSound": "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", "alarmName": "Classic Bell"}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_time DATETIME,
      location_lat REAL,
      location_lng REAL,
      location_radius REAL,
      status TEXT DEFAULT 'active', -- active, completed, ignored, snoozed
      priority TEXT DEFAULT 'normal', -- normal, high, emergency
      context_type TEXT, -- time, location, routine, emotion
      recurrence TEXT DEFAULT 'none', -- none, daily, weekly, monthly
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      relation TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  
    CREATE TABLE IF NOT EXISTS game_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_type TEXT NOT NULL,
      score INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  
    CREATE TABLE IF NOT EXISTS user_routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      routine_data TEXT NOT NULL, -- JSON blob of learned patterns
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log("Database tables initialized.");
} catch (err) {
  console.error("Database initialization error:", err);
}

// Migration: Add recurrence column if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(reminders)").all() as any[];
  const hasRecurrence = tableInfo.some(col => col.name === 'recurrence');
  if (!hasRecurrence) {
    db.exec("ALTER TABLE reminders ADD COLUMN recurrence TEXT DEFAULT 'none'");
    console.log("Added 'recurrence' column to 'reminders' table.");
  }
} catch (err) {
  console.error("Migration error:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // --- Health Check ---
  app.get("/api/health", (req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.json({ status: "ok", database: "connected" });
    } catch (err: any) {
      res.status(500).json({ status: "error", database: err.message });
    }
  });

  // Ensure default user exists
  try {
    const defaultUser = db.prepare("SELECT * FROM users WHERE id = 1").get();
    if (!defaultUser) {
      db.prepare("INSERT INTO users (id, password) VALUES (?, ?)").run(1, "");
      console.log("Created default user.");
    }
  } catch (err) {
    console.error("Error creating default user:", err);
  }

  // --- Master Password Auth Routes ---
  app.get("/api/auth/status", (req, res) => {
    try {
      const user = db.prepare("SELECT password FROM users WHERE id = 1").get() as any;
      const hasPassword = user && user.password && user.password !== "";
      res.json({ hasPassword: !!hasPassword });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/setup", async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = 1").run(hashedPassword);
      const user = db.prepare("SELECT * FROM users WHERE id = 1").get() as any;
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: "User", 
          settings: JSON.parse(user.settings || '{}')
        } 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/unlock", async (req, res) => {
    const { password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = 1").get() as any;
      if (!user || !user.password) {
        return res.status(401).json({ success: false, error: "Password not set" });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Incorrect password" });
      }

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: "User", 
          settings: JSON.parse(user.settings || '{}')
        } 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  app.post("/api/auth/change-password", async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) return res.status(400).json({ error: "All fields are required" });

    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: "Incorrect old password" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
      
      res.json({ success: true, message: "Password changed successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  app.get("/api/me", (req, res) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = 1").get() as any;
      if (user) {
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            name: "User", 
            settings: JSON.parse(user.settings || '{}')
          } 
        });
      } else {
        res.status(404).json({ success: false, error: "User not found" });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Reminder Routes ---
  app.get("/api/reminders/:userId", (req, res) => {
    const reminders = db.prepare("SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(reminders);
  });

  app.post("/api/reminders", (req, res) => {
    const { user_id, title, description, due_time, location_lat, location_lng, location_radius, priority, context_type, recurrence } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO reminders (user_id, title, description, due_time, location_lat, location_lng, location_radius, priority, context_type, recurrence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(user_id, title, description, due_time, location_lat, location_lng, location_radius, priority, context_type, recurrence || 'none');
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      console.error("Create reminder error:", err);
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.patch("/api/reminders/:id", (req, res) => {
    const { status, title, description, due_time, priority, recurrence } = req.body;
    
    try {
      db.prepare(`
        UPDATE reminders 
        SET title = COALESCE(?, title), 
            description = COALESCE(?, description), 
            due_time = COALESCE(?, due_time), 
            priority = COALESCE(?, priority), 
            recurrence = COALESCE(?, recurrence),
            status = COALESCE(?, status)
        WHERE id = ?
      `).run(title, description, due_time, priority, recurrence, status, req.params.id);
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("Update reminder error:", err);
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/reminders/:id", (req, res) => {
    db.prepare("DELETE FROM reminders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Emergency Contacts Routes ---
  app.get("/api/emergency-contacts/:userId", (req, res) => {
    const contacts = db.prepare("SELECT * FROM emergency_contacts WHERE user_id = ?").all(req.params.userId);
    res.json(contacts);
  });

  app.post("/api/emergency-contacts", (req, res) => {
    const { user_id, name, phone, relation } = req.body;
    const stmt = db.prepare("INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)");
    const info = stmt.run(user_id, name, phone, relation);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.delete("/api/emergency-contacts/:id", (req, res) => {
    db.prepare("DELETE FROM emergency_contacts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Game Scores Routes ---
  app.get("/api/game-scores/:userId", (req, res) => {
    const scores = db.prepare("SELECT * FROM game_scores WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10").all(req.params.userId);
    res.json(scores);
  });

  app.post("/api/game-scores", (req, res) => {
    const { user_id, game_type, score } = req.body;
    const stmt = db.prepare("INSERT INTO game_scores (user_id, game_type, score) VALUES (?, ?, ?)");
    const info = stmt.run(user_id, game_type, score);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  // --- Insights Routes ---
  app.get("/api/insights/:userId", (req, res) => {
    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE user_id = ?").get(req.params.userId) as any;
      const completed = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND status = 'completed'").get(req.params.userId) as any;
      const ignored = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND status = 'ignored'").get(req.params.userId) as any;
      const active = db.prepare("SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND status = 'active'").get(req.params.userId) as any;
      
      const byPriority = db.prepare("SELECT priority, COUNT(*) as count FROM reminders WHERE user_id = ? GROUP BY priority").all(req.params.userId);
      const byContext = db.prepare("SELECT context_type, COUNT(*) as count FROM reminders WHERE user_id = ? GROUP BY context_type").all(req.params.userId);
      
      res.json({
        total: total.count,
        completed: completed.count,
        ignored: ignored.count,
        active: active.count,
        byPriority,
        byContext
      });
    } catch (err: any) {
      console.error("Insights error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Settings Routes ---
  app.patch("/api/users/:id/settings", (req, res) => {
    const { settings } = req.body;
    try {
      db.prepare("UPDATE users SET settings = ? WHERE id = ?").run(JSON.stringify(settings), req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // --- 404 Handler for API ---
  app.all("/api/*", (req, res) => {
    console.log(`404 for API route: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  });
}

startServer();
