// vendors.model.js
const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		email: {
			type: String,
			required: true,
			lowercase: true,
		},

		category: {
			type: String,
			required: true,
		},

		phone: {
			type: String,
		},

		address: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Vendor", VendorSchema);
