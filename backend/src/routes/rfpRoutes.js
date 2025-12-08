const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

// Routes
router.post('/rfps', rfpController.createRfp);
router.post('/rfps/:id/send', rfpController.sendRfp);
router.get('/rfps/:id/proposals', rfpController.getRfpProposals);
router.get("/rfps", rfpController.getAllRfps);
router.get("/vendors", rfpController.getAllVendors);

// Utilities
router.post('/seed', rfpController.seedVendors);
router.post('/check-emails', rfpController.triggerEmailCheck);

module.exports = router;
