const { z } = require("zod");

const createRfpSchema = z.object({
	prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
	title: z.string().optional(),
	requirements: z.array(z.any()).optional(), // validation can be stricter if we want
});

module.exports = { createRfpSchema };
