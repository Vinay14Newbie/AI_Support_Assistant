import express from "express";
import { db } from "../config/db.js";
import { findRelevantDocs } from "../services/docsService.js";
import { generateAnswer } from "../services/llmService.js";

const router = express.Router();

router.post("/chat", async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Missing sessionId or message" });
    }

    // Create session if not exists
    await db.execute({
      sql: "INSERT OR IGNORE INTO sessions (id) VALUES (?)",
      args: [sessionId],
    });

    // Store user message
    await db.execute({
      sql: "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
      args: [sessionId, "user", message],
    });

    // Fetch last 10 messages
    const historyResult = await db.execute({
      sql: `
        SELECT role, content
        FROM messages
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `,
      args: [sessionId],
    });

    const history = historyResult.rows.reverse();

    // Find relevant docs
    const relevantDocs = findRelevantDocs(message);

    if (relevantDocs.length === 0) {
      const fallback = "Sorry, I don’t have information about that.";
      // store assistant fallback
      await db.execute({
        sql: "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
        args: [sessionId, "assistant", fallback],
      });
      // update session timestamp
      await db.execute({
        sql: "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [sessionId],
      });
      return res.json({
        reply: fallback,
        tokensUsed: 0,
      });
    }

    const { reply, tokensUsed } = await generateAnswer({
      docs: relevantDocs,
      history,
      question: message,
    });

    // Store assistant reply
    await db.execute({
      sql: "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
      args: [sessionId, "assistant", reply],
    });

    // Update session timestamp
    await db.execute({
      sql: "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [sessionId],
    });

    res.json({ reply, tokensUsed });
  } catch (error) {
    next(error);
  }
});

// Fetch conversation
router.get("/conversations/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const result = await db.execute({
      sql: `
        SELECT role, content, created_at
        FROM messages
        WHERE session_id = ?
        ORDER BY created_at ASC
      `,
      args: [sessionId],
    });

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// List sessions
router.get("/sessions", async (req, res, next) => {
  try {
    const result = await db.execute(`
      SELECT * FROM sessions
      ORDER BY updated_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
