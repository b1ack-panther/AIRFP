const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");

// Get proposals for a specific RFP
// Route: /api/proposals/rfp/:id
router.get("/rfp/:id", proposalController.getProposalsByRfpId);

// Get single proposal
// Route: /api/proposals/:id
router.get("/:id", proposalController.getProposalById);

module.exports = router;
