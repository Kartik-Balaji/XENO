'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { generatePlay } = require('../services/playEngine');

/**
 * POST /api/plays/generate
 * Generate a play from a goal string.
 * Persists the play to DB and returns it.
 */
router.post('/generate', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'Missing required field: goal (string)' });
    }

    // Generate play (stub or real engine)
    const play = await generatePlay(goal);

    // Persist to plays table
    const db = await getDb();
    const now = new Date().toISOString();
    await db.run(
      `INSERT OR REPLACE INTO plays
         (play_id, play_name, objective, goal_text, audience_json, reasoning,
          recommended_send_time, recommended_channels, offer_strategy,
          message_variants_json, predicted_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        play.play_id,
        play.play_name,
        play.objective,
        play.goal_text || goal,
        JSON.stringify(play.audience),
        play.reasoning,
        play.recommended_send_time,
        JSON.stringify(play.recommended_channels),
        JSON.stringify(play.offer_ladder),
        JSON.stringify(play.message_variants || []),
        JSON.stringify(play.predicted),
        now,
      ]
    );

    return res.status(201).json(play);
  } catch (err) {
    console.error('POST /plays/generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/plays/:play_id
 * Fetch a persisted play from DB.
 */
router.get('/:play_id', async (req, res) => {
  try {
    const { play_id } = req.params;
    const db = await getDb();
    const row = await db.get('SELECT * FROM plays WHERE play_id = ?', [play_id]);
    if (!row) {
      return res.status(404).json({ error: `Play not found: ${play_id}` });
    }

    // Parse JSON fields
    const play = {
      ...row,
      audience: safeJson(row.audience_json),
      recommended_channels: safeJson(row.recommended_channels),
      offer_ladder: safeJson(row.offer_strategy),
      message_variants: safeJson(row.message_variants_json),
      predicted: safeJson(row.predicted_json),
    };

    return res.json(play);
  } catch (err) {
    console.error('GET /plays/:play_id error:', err);
    res.status(500).json({ error: err.message });
  }
});

function safeJson(str) {
  try { return JSON.parse(str); } catch (_) { return null; }
}

module.exports = router;
