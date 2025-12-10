const { GoogleGenAI } = require("@google/genai");

const SchemaType = {
	STRING: "STRING",
	NUMBER: "NUMBER",
	INTEGER: "INTEGER",
	BOOLEAN: "BOOLEAN",
	ARRAY: "ARRAY",
	OBJECT: "OBJECT",
};

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.generateRfpData = async (userPrompt, currentData = null) => {
	const rfpSchema = {
		type: SchemaType.OBJECT,
		properties: {
			title: { type: SchemaType.STRING },
			total_budget: { type: SchemaType.NUMBER, nullable: true },
			requirements: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						item: {
							type: SchemaType.STRING,
							description: "Name of the item (e.g., Laptops, Monitors)",
						},
						quantity: {
							type: SchemaType.STRING,
							description: "Quantity needed (e.g., 50 units, 100 hours)",
						},
						budget: {
							type: SchemaType.NUMBER,
							nullable: true,
							description: "Target budget per unit/item if specified",
						},
						specifications: {
							type: SchemaType.STRING,
							description:
								"Technical specifications or details extracted from prompt",
						},
						warranty: {
							type: SchemaType.STRING,
							nullable: true,
							description: "Warranty requirements if mentioned",
						},
					},
					required: ["item", "quantity"],
				},
			},
			timeline: {
				type: SchemaType.STRING,
				description: "Timeline for the project (e.g., 1 month, 2 weeks)",
			},
			mail_body: {
				type: SchemaType.STRING,
				description:
					"Professional email body inviting vendors for detailed quotation for the requirements.",
			},
		},
		required: ["title", "requirements", "timeline", "mail_body"],
	};

	let systemInstruction = `You are a Procurement Architect. 
      
      1. Analyze the user's prompt.
      2. Extract a list of requirements (line items), including quantities, specs, warranty, and item budgets.
      3. If a global budget is mentioned, set 'total_budget'.
      4. Generate a professional 'mail_body' that:
         - Is polite and professional.
         - clearly tests the requirements.
         - avoids placeholders like [Your Name].
      `;

	let userContent = userPrompt;

	if (currentData) {
		systemInstruction = `You are a Procurement Architect.
        You are given an EXISTING RFP data structure and a user's REQUEST TO MODIFY it.
        
        1. Analyze the existing RFP data and the user's modification request.
        2. Apply the requested changes (add/remove items, update quantities/specs/budgets).
        3. Maintain the integrity of unchanged items.
        4. Regenerate the 'mail_body' to reflect the updated requirements.
        5. Return the FULLY UPDATED RFP structure.`;

		userContent = `CURRENT RFP DATA:\n${JSON.stringify(
			currentData,
			null,
			2
		)}\n\nUSER MODIFICATION REQUEST:\n"${userPrompt}"`;
	}

	const response = await genAI.models.generateContent({
		model: "gemini-2.0-flash-exp",
		contents: [{ role: "user", parts: [{ text: userContent }] }],
		config: {
			systemInstruction: systemInstruction,
			responseMimeType: "application/json",
			responseSchema: rfpSchema,
			temperature: 0.1,
		},
	});

	return JSON.parse(response.candidates[0].content.parts[0].text);
};

exports.extractProposalData = async (emailText, requirements) => {
	const requirementsList = requirements
		.map((req) => `- Item: ${req.item} (Qty: ${req.quantity})`)
		.join("\n");

	const schema = {
		type: SchemaType.OBJECT,
		properties: {
			extracted_data: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						item: { type: SchemaType.STRING },
						quantity: { type: SchemaType.STRING },
						price: {
							type: SchemaType.NUMBER,
							description: "Total price for this line item",
						},
						specifications: { type: SchemaType.STRING },
						warranty: { type: SchemaType.STRING },
					},
					required: ["item", "price"],
				},
			},
			compliance: {
				type: SchemaType.NUMBER,
				description:
					"Compliance score (0-100) indicating how well the vendor meets the requirements.",
			},
			timeline: {
				type: SchemaType.STRING,
				description: "Time required by vendor for delivery ",
			},
		},
		required: ["extracted_data", "compliance", "timeline"],
	};

	const prompt = `
  Analyze the Vendor Email.
  
  The user asked for:
  ${requirementsList}

  Extract the vendor's line items matching these requirements.
  For each item, extract:
  - item name
  - quantity offered
  - price (Total Price for the line item)		
  - specifications (Technical specifications or details extracted from prompt)
  - warranty (Warranty requirements if mentioned)

  Also provide a "compliance" score (0-100).

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

	return JSON.parse(response.candidates[0].content.parts[0].text);
};

exports.compareProposals = async (rfpData, proposalsData) => {
	const schema = {
		type: SchemaType.OBJECT,
		properties: {
			best_proposal_id: {
				type: SchemaType.STRING,
				description: "The proposal_id of the selected best proposal",
			},
			justification: {
				type: SchemaType.ARRAY,
				items: { type: SchemaType.STRING },
				description:
					"3+ bullet points justifying the selection based on compliance and value",
			},
		},
		required: ["best_proposal_id", "justification"],
	};

	const prompt = `
    Compare these vendor proposals against the RFP Requirements.
    Identify the BEST proposal based on Compliance (primary), Cost, and Timeline.
    
    RFP REQUIREMENTS:
    ${JSON.stringify(rfpData, null, 2)}

    PROPOSALS (Each has a 'proposal_id' and 'vendor_name'):
    ${JSON.stringify(proposalsData, null, 2)}

    Output the winner's 'best_proposal_id' (extracted from the input proposal data) and 3+ detailed justification points explaining why they have the highest compliance/value.
    IMPORTANT: In the justification bullet points, refer to the vendor by their 'vendor_name'.
    `;

	const response = await genAI.models.generateContent({
		model: "gemini-2.0-flash-exp",
		contents: [{ role: "user", parts: [{ text: prompt }] }],
		config: {
			systemInstruction:
				"You are a Procurement Specialist. Evaluate proposals objectively.",
			responseMimeType: "application/json",
			responseSchema: schema,
		},
	});

	return JSON.parse(response.candidates[0].content.parts[0].text);
};
