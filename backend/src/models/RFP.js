const mongoose = require("mongoose");

const RequirementSchema = new mongoose.Schema(
	{
		item: { type: String, required: true },
		quantity: { type: String, required: true }, // e.g. "50 units", "100 hours"
		budget: { type: Number, default: null }, // Target budget per item if available
		specifications: { type: String, default: "" },
		warranty: { type: String, default: null }, // e.g. "1 year"
	},
	{ _id: false }
);

const RfpSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },

		// user’s raw input (prompt for AI)
		original_prompt: { type: String, required: true },

		// AI-generated email content
		mail_body: { type: String },

		status: {
			type: String,
			default: "DRAFT",
		},

		total_budget: { type: Number, default: null },
		timeline: { type: String, default: null }, // e.g. "Delivery by Q3"

		// specific requirements extracted from prompt
		requirements: [RequirementSchema],

		// vendors selected for this RFP
		vendors: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Vendor",
			},
		],

		// AI Comparison Result
		best_vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
		justification: { type: [String], default: [] },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("RFP", RfpSchema);
