const { z } = require("zod");

const createVendorSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	category: z.string().min(2, "Category is required"),
	phone: z.string().optional(),
	address: z.string().optional(),
});

module.exports = { createVendorSchema };
