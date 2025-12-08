const mongoose = require("mongoose");

const ComparisonColumnSchema = new mongoose.Schema(
	{
		key: { type: String, required: true }, // e.g. total_cost
		label: { type: String, required: true }, // e.g. Total Cost
		type: {
			type: String,
			enum: ["number", "text", "days", "months", "currency"],
			default: "text",
		},
		unit: { type: String }, // USD, days, months
		required: { type: Boolean, default: false },
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
			enum: ["DRAFT", "SENT", "RESPONSES", "AWARDED"],
			default: "DRAFT",
		},

		// dynamic comparison definition (core of decision making)
		comparison_columns: [ComparisonColumnSchema],

		// vendors selected for this RFP
		vendors: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Vendor",
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("RFP", RfpSchema);
