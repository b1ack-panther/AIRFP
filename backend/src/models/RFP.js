const mongoose = require("mongoose");

const RequirementSchema = new mongoose.Schema(
	{
		item: { type: String, required: true },
		quantity: { type: String, required: true },
		budget: { type: Number, default: null },
		specifications: { type: String, default: "" },
		warranty: { type: String, default: null },
	},
	{ _id: false }
);

const RfpSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },

		original_prompt: { type: String, required: true },

		mail_body: { type: String },

		status: {
			type: String,
			default: "DRAFT",
		},

		total_budget: { type: Number, default: null },
		timeline: { type: String, default: null },

		requirements: [RequirementSchema],

		proposals: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Proposal",
			},
		],

		best_proposal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
		justification: { type: [String], default: [] },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("RFP", RfpSchema);
