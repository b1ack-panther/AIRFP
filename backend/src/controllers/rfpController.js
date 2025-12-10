const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");
const Proposal = require("../models/Proposal");
const aiService = require("../services/aiService");
const emailService = require("../services/emailService");

exports.createRfp = async (req, res) => {
	try {
		const { prompt, rfpId } = req.body;

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

		const aiResponse = await aiService.generateRfpData(prompt, currentData);

		if (rfp) {
			rfp.title = aiResponse.title;
			rfp.requirements = aiResponse.requirements;
			rfp.total_budget = aiResponse.total_budget;
			rfp.timeline = aiResponse.timeline;
			rfp.mail_body = aiResponse.mail_body;
		} else {
			rfp = new RFP({
				title: aiResponse.title,
				original_prompt: prompt,
				requirements: aiResponse.requirements,
				total_budget: aiResponse.total_budget,
				timeline: aiResponse.timeline,
				status: "DRAFT",
				mail_body: aiResponse.mail_body,
			});
		}

		await rfp.save();
		res.status(201).json(rfp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to create/update RFP" });
	}
};

exports.getRfp = async (req, res) => {
	try {
		const { id } = req.params;
		const rfp = await RFP.findById(id).populate({
			path: "proposals",
			populate: { path: "vendor" },
		});
		if (!rfp) return res.status(404).json({ error: "RFP not found" });
		res.json(rfp);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.sendRfp = async (req, res) => {
	try {
		const { id } = req.params;
		let { vendorIds } = req.body;

		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });

		// Populate proposals to check existing vendors
		await rfp.populate({
			path: "proposals",
			populate: { path: "vendor" },
		});

		const existingVendorIds = rfp.proposals.map((p) => p.vendor._id.toString());
		vendorIds = vendorIds.filter((id) => !existingVendorIds.includes(id));
		const vendors = await Vendor.find({ _id: { $in: vendorIds } });

		if (vendors.length === 0) {
			return res.status(400).json({ error: "No valid vendors selected" });
		}

		// rfp.vendors.push is removed as we now track proposals
		await emailService.sendRfpEmails(rfp, vendors);

		const proposals = vendors.map((vendor) => ({
			rfp: rfp._id,
			vendor: vendor._id,
			status: "sent",
			received_at: new Date(),
		}));
		const savedProposals = await Proposal.insertMany(proposals);

		// Link proposals to RFP
		rfp.proposals.push(...savedProposals.map((p) => p._id));

		rfp.status = "sent";
		await rfp.save();

		res.json({ message: `Sent to ${vendors.length} vendors` });
	} catch (err) {
		console.error("Send Error:", err);
		res.status(500).json({ error: err.message });
	}
};

exports.getRfpProposals = async (req, res) => {
	try {
		const { id } = req.params;
		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });

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

exports.getAllRfps = async (req, res) => {
	try {
		const rfps = await RFP.find().sort({ createdAt: -1 });
		res.json(rfps);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.triggerEmailCheck = async (req, res) => {
	try {
		await emailService.checkInboxForResponses();
		res.json({ message: "Inbox check initiated" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to check emails" });
	}
};
