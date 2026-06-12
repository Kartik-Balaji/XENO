'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/db');
const { aggregateCampaignAnalytics } = require('../services/analyticsAggregator');

/**
 * GET /api/campaigns/:id/analytics
 * Returns Performance Kitchen metrics for a campaign.
 */
router.get('/', async (req, res) => {
  try {
    const campaign_id = req.params.id;
    const db = await getDb();

    const analytics = await aggregateCampaignAnalytics(db, campaign_id);
    if (!analytics) {
      return res.status(404).json({ error: `Campaign not found: ${campaign_id}` });
    }

    return res.json(analytics);
  } catch (err) {
    console.error('GET /campaigns/:id/analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
