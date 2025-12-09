const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");

router.get("/rfp/:id", proposalController.getProposalsByRfpId);

router.get("/:id", proposalController.getProposalById);

module.exports = router;
