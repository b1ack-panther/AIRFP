const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");
const Proposal = require("../models/Proposal");
const aiService = require("../services/aiService");
const emailService = require("../services/emailService");

// 1. Create RFP (Trigger AI Architect)
// 1. Create or Update RFP (Trigger AI Architect)
exports.createRfp = async (req, res) => {
	try {
		const { prompt, rfpId } = req.body; // Support both naming conventions

		if (!prompt) return res.status(400).json({ error: "Prompt is required" });

		let currentData = null;
		let rfp = null;

		if (rfpId) {
			rfp = await RFP.findById(rfpId);
			if (!rfp) return res.status(404).json({ error: "RFP not found" });

			if (rfp.status !== "DRAFT") {
				return res
					.status(400)
					.json({ error: "Only DRAFT RFPs can be refined" });
			}
			currentData = {
				title: rfp.title,
				total_budget: rfp.total_budget,
				timeline: rfp.timeline,
				requirements: rfp.requirements,
			};
		}

		// 1. Call Gemini to structure the data (with context if updating)
		console.log(currentData, prompt)
		const aiResponse = await aiService.generateRfpData(prompt, currentData);
		console.log(aiResponse);
		// 2. Create or Update DB Entry
		if (rfp) {
			// Update existing RFP
			rfp.title = aiResponse.title;
			rfp.requirements = aiResponse.requirements;
			rfp.total_budget = aiResponse.total_budget;
			rfp.timeline = aiResponse.timeline;
		} else {
			// Create new RFP
			rfp = new RFP({
				title: aiResponse.title,
				original_prompt: prompt,
				requirements: aiResponse.requirements,
				total_budget: aiResponse.total_budget,
				timeline: aiResponse.timeline,
				status: "DRAFT",
			});
		}

		await rfp.save();
		res.status(201).json(rfp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to create/update RFP" });
	}
};

// 2a. Get Single RFP
exports.getRfp = async (req, res) => {
	try {
		const { id } = req.params;
		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });
		res.json(rfp);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// 2b. Send RFP to Vendors
exports.sendRfp = async (req, res) => {
	try {
		const { id } = req.params;
		let { vendorIds } = req.body;

		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });

		console.log(vendorIds)
		vendorIds = vendorIds.filter(id => !rfp.vendors.includes(id));
		console.log(vendorIds)
		const vendors = await Vendor.find({ _id: { $in: vendorIds } });
		console.log(vendors)
		if (vendors.length === 0) {
			return res.status(400).json({ error: "No valid vendors selected" });
		}

		rfp.vendors.push(...vendorIds);
		await emailService.sendRfpEmails(rfp, vendors);
		rfp.status = "SENT";
		await rfp.save();

		res.json({ message: `Sent to ${vendors.length} vendors` });
	} catch (err) {
		console.error("Send Error:", err);
		res.status(500).json({ error: err.message });
	}
};

// 3. Get Dashboard Data (Columns + Proposals)
exports.getRfpProposals = async (req, res) => {
	try {
		const { id } = req.params;
		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });

		// CHANGE: Query uses 'rfp' (the ObjectId ref), not 'rfp_id'
		// Added populate to see Vendor names in the dashboard
		const proposals = await Proposal.find({ rfp: id }).populate(
			"vendor",
			"name email category"
		);

		res.json({
			meta: rfp,
			requirements: rfp.requirements,
			proposals: proposals,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// 4. Get All RFPs (For Dashboard)
exports.getAllRfps = async (req, res) => {
	try {
		const rfps = await RFP.find().sort({ createdAt: -1 });
		res.json(rfps);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getAllVendors = async (req, res) => {
	try {
		const vendors = await Vendor.find();
		return res.json(vendors);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error?.message });
	}
};

// 6. Manual Email Check Trigger
exports.triggerEmailCheck = async (req, res) => {
	try {
		await emailService.checkInboxForResponses();
		res.json({ message: "Inbox check initiated" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to check emails" });
	}
};

// 7. Refine RFP (Draft -> Draft)
exports.refineRfp = async (req, res) => {
	try {
		const { id } = req.params;
		const { prompt } = req.body;

		if (!prompt) return res.status(400).json({ error: "Prompt is required" });

		// Call AI with context
		const aiResponse = await aiService.generateRfpData(prompt, currentData);

		// Update fields
		rfp.title = aiResponse.title;
		rfp.requirements = aiResponse.requirements;
		rfp.total_budget = aiResponse.total_budget;
		// Don't change status, remains DRAFT

		await rfp.save();
		res.json(rfp);
	} catch (err) {
		console.error("Refine Error:", err);
		res.status(500).json({ error: "Failed to refine RFP" });
	}
};
