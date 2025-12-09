const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema({
	rfp: { type: mongoose.Schema.Types.ObjectId, ref: "RFP", required: true },
	vendor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Vendor",
		required: true,
	},
	received_at: { type: Date, default: Date.now },
	extracted_data: [
		{
			item: String,
			quantity: String,
			price: Number,
			warranty: String,
			specifications: String,
		},
	],
	compliance: Number,
	timeline: String,
});

module.exports = mongoose.model("Proposal", ProposalSchema);
