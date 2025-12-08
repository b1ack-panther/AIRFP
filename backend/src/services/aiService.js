const { GoogleGenAI, SchemaType } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Stage 1: The Architect (Structure + Data)
 * Extracts BOTH the column definition AND the user's specific requirement.
 */
exports.generateRfpData = async (userPrompt) => {
	const schema = {
		type: SchemaType.OBJECT,
		properties: {
			title: { type: SchemaType.STRING },
			comparison_columns: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						key: {
							type: SchemaType.STRING,
							description: "Snake_case key (e.g., ram_size)",
						},
						label: {
							type: SchemaType.STRING,
							description: "Label (e.g., RAM Size)",
						},
						type: {
							type: SchemaType.STRING,
							enum: ["number", "text", "days", "months", "currency"],
						},
						unit: { type: SchemaType.STRING, nullable: true },

						// HERE IS THE FIX: The AI now extracts the specific value from the prompt
						target_value: {
							type: SchemaType.STRING,
							nullable: true,
							description:
								"The specific constraint mentioned by the user (e.g. '16GB', 'Must have ISO cert'). Leave null if generic.",
						},
					},
					required: ["key", "label", "type"],
				},
			},
		},
		required: ["title", "comparison_columns"],
	};

	const response = await genAI.models.generateContent({
		model: "gemini-2.0-flash-exp",
		contents: [{ role: "user", parts: [{ text: userPrompt }] }],
		config: {
			systemInstruction: `You are a Procurement Parser. 
      
      1. Analyze the user's prompt.
      2. Identify the decision factors (columns).
      3. If the user specified a requirement value, extract it into 'target_value'.
      
      Example:
      User: "I need 16GB RAM laptops under $1000"
      Output:
      [
        { key: "total_cost", label: "Total Cost", type: "currency", target_value: "1000" },
        { key: "ram", label: "RAM", type: "text", target_value: "16GB" }
      ]`,
			responseMimeType: "application/json",
			responseSchema: schema,
			temperature: 0.1, // Lower temperature for precision
		},
	});

	return JSON.parse(response.text());
};

/**
 * Stage 2: The Extractor
 * Uses the comparison_columns (which now contain target_values) to extract Vendor Data.
 */
exports.extractProposalData = async (emailText, comparisonColumns) => {
	const dynamicProperties = {};
	const requiredKeys = [];

	// We use the same array, but we are only interested in key/label/type for extraction
	// The 'target_value' is ignored here because we want the VENDOR'S value, not the User's.
	const fieldDescriptions = comparisonColumns.map((col) => {
		let schemaType = SchemaType.STRING;
		if (["number", "currency", "days", "months"].includes(col.type)) {
			schemaType = SchemaType.NUMBER;
		}

		dynamicProperties[col.key] = { type: schemaType, nullable: true };
		requiredKeys.push(col.key);

		return `- Extract "${col.label}" and save it to field "${col.key}"`;
	});

	const schema = {
		type: SchemaType.OBJECT,
		properties: dynamicProperties,
		required: requiredKeys,
	};

	const prompt = `
  Analyze the Vendor Email.
  Extract specific data for these fields:
  ${fieldDescriptions.join("\n")}

  VENDOR EMAIL:
  "${emailText}"
  `;

	const response = await genAI.models.generateContent({
		model: "gemini-2.0-flash-exp",
		contents: [{ role: "user", parts: [{ text: prompt }] }],
		config: {
			systemInstruction:
				"You are a Data Extractor. Extract values strictly based on the requested keys.",
			responseMimeType: "application/json",
			responseSchema: schema,
		},
	});

	return JSON.parse(response.text());
};
