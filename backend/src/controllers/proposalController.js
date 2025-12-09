const Proposal = require("../models/Proposal");
const RFP = require("../models/RFP");

exports.getProposalsByRfpId = async (req, res) => {
	try {
		const { id } = req.params;

		const rfp = await RFP.findById(id);
		if (!rfp) {
			return res.status(404).json({ error: "RFP not found" });
		}

		const proposals = await Proposal.find({ rfp: id })
			.populate("vendor", "name email category")
			.sort({ received_at: -1 });

		const proposalsWithStats = proposals.map((p) => {
			const pObj = p.toObject();
			const totalCost = p.extracted_data.reduce(
				(sum, item) => sum + (item.price || 0),
				0
			);
			return {
				...pObj,
				totalCost,
			};
		});

		res.json(proposalsWithStats);
	} catch (error) {
		console.error("Error fetching proposals:", error);
		res.status(500).json({ error: "Failed to fetch proposals" });
	}
};

exports.getProposalById = async (req, res) => {
	try {
		const { id } = req.params;
		const proposal = await Proposal.findById(id).populate(
			"vendor",
			"name email category"
		);

		if (!proposal) {
			return res.status(404).json({ error: "Proposal not found" });
		}

		res.json(proposal);
	} catch (error) {
		console.error("Error fetching proposal:", error);
		res.status(500).json({ error: "Failed to fetch proposal" });
	}
};
