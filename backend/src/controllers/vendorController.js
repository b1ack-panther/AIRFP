const Vendor = require("../models/Vendor");

// Get all vendors (with optional search)
exports.getAllVendors = async (req, res) => {
	try {
		const { search } = req.query;
		let query = {};

		if (search) {
			query = {
				$or: [
					{ name: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
					{ category: { $regex: search, $options: "i" } },
				],
			};
		}

		const vendors = await Vendor.find(query).sort({ name: 1 });
		res.json(vendors);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch vendors" });
	}
};

// Create a new vendor
exports.createVendor = async (req, res) => {
	try {
		const { name, email, category, phone, address } = req.body;

		// Check if email already exists
		const existingVendor = await Vendor.findOne({ email });
		if (existingVendor) {
			return res
				.status(400)
				.json({ error: "Vendor with this email already exists" });
		}

		const vendor = new Vendor({
			name,
			email,
			category,
			phone,
			address,
		});

		await vendor.save();
		res.status(201).json(vendor);
	} catch (error) {
		res.status(500).json({ error: "Failed to create vendor" });
	}
};

// Update a vendor
exports.updateVendor = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		const vendor = await Vendor.findByIdAndUpdate(id, updates, { new: true });

		if (!vendor) {
			return res.status(404).json({ error: "Vendor not found" });
		}

		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: "Failed to update vendor" });
	}
};

// Delete a vendor
exports.deleteVendor = async (req, res) => {
	try {
		const { id } = req.params;
		const vendor = await Vendor.findByIdAndDelete(id);

		if (!vendor) {
			return res.status(404).json({ error: "Vendor not found" });
		}

		res.json({ message: "Vendor deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete vendor" });
	}
};
