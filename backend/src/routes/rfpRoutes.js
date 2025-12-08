const express = require("express");
const router = express.Router();
const rfpController = require("../controllers/rfpController");

// Routes
router.post("", rfpController.createRfp);
router.post("/:id/send", rfpController.sendRfp);
router.get("/:id/proposals", rfpController.getRfpProposals);
router.get("/:id", rfpController.getRfp);
router.get("", rfpController.getAllRfps);

// Utilities
router.post("/check-emails", rfpController.triggerEmailCheck);

module.exports = router;
