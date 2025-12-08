const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");
const Proposal = require("../models/Proposal");
const aiService = require("../services/aiService");
const emailService = require("../services/emailService");

// 1. Create RFP (Trigger AI Architect)
exports.createRfp = async (req, res) => {
	try {
		const { prompt } = req.body;
		if (!prompt) return res.status(400).json({ error: "Prompt is required" });

		// 1. Call Gemini to structure the data
		// CHANGE: Updated method name to match your new AI service
		const aiResponse = await aiService.generateRfpData(prompt);

		// 2. Create DB Entry
		// CHANGE: Removed budget/currency/deadline fields.
		// They are now dynamic rows inside 'comparison_columns' with 'target_value'.
		const rfp = new RFP({
			title: aiResponse.title,
			original_prompt: prompt,
			comparison_columns: aiResponse.comparison_columns,
			status: "DRAFT",
		});

		await rfp.save();
		res.status(201).json(rfp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to create RFP" });
	}
};

// 2. Send RFP to Vendors
exports.sendRfp = async (req, res) => {
	try {
		const { id } = req.params;
		const { vendorIds } = req.body;

		const rfp = await RFP.findById(id);
		if (!rfp) return res.status(404).json({ error: "RFP not found" });

		const vendors = await Vendor.find({ _id: { $in: vendorIds } });

		if (vendors.length === 0) {
			return res.status(400).json({ error: "No valid vendors selected" });
		}

		// CHANGE: Update the RFP with selected vendors so we know who participated
		rfp.vendors = vendors.map((v) => v._id);
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
			columns: rfp.comparison_columns,
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

// 5. Seed Data Helper & Get Vendors
exports.seedVendors = async () => {
	try {
		// Clear existing to avoid duplicates in demo
		await Vendor.deleteMany({});

		await Vendor.create([
			{
				name: "Tech Corp",
				email: "saurabh0332vns@gmail.com", // Keeping your test email
				category: "Electronics",
			},
			{
				name: "Global Solutions",
				email: "ssbs8604vns@gmail.com",
				category: "Software",
			},
		]);
	} catch (err) {
		console.log(err);
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
