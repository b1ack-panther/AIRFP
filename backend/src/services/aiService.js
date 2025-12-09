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
	const schema = {
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
		},
		required: ["title", "requirements", "timeline"],
	};

	let systemInstruction = `You are a Procurement Architect. 
      
      1. Analyze the user's prompt.
      2. Extract a list of requirements (line items).
      3. For each item, extract the quantity, technical specifications, warranty requirements, and any specific budget mentioned.
      4. If a global budget is mentioned, set 'total_budget'.
      
      Example:
      User: "I need 10 laptops ($1000 each) with 16GB RAM and 5 monitors. Total budget $15000. 1 year warranty."
      Output:
      {
        "title": "Procurement for Laptops and Monitors",
        "total_budget": 15000,
        "requirements": [
            { "item": "Laptops", "quantity": "10", "budget": 1000, "specifications": "16GB RAM", "warranty": "1 year" },
            { "item": "Monitors", "quantity": "5", "budget": null, "specifications": "", "warranty": "1 year" }
        ]
      }`;

	let userContent = userPrompt;

	if (currentData) {
		systemInstruction = `You are a Procurement Architect.
        You are given an EXISTING RFP data structure and a user's REQUEST TO MODIFY it.
        
        1. Analyze the existing RFP data and the user's modification request.
        2. Apply the requested changes (add items, remove items, update quantities/specs/budgets).
        3. Maintain the integrity of unchanged items.
        4. Return the FULLY UPDATED RFP structure matching the schema.
        `;

		userContent = `
        CURRENT RFP DATA:
        ${JSON.stringify(currentData, null, 2)}

        USER MODIFICATION REQUEST:
        "${userPrompt}"
        `;
	}

	const response = await genAI.models.generateContent({
		model: "gemini-2.0-flash-exp",
		contents: [{ role: "user", parts: [{ text: userContent }] }],
		config: {
			systemInstruction: systemInstruction,
			responseMimeType: "application/json",
			responseSchema: schema,
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
			best_vendor_email: {
				type: SchemaType.STRING,
				description: "Email of the selected best vendor",
			},
			justification: {
				type: SchemaType.ARRAY,
				items: { type: SchemaType.STRING },
				description:
					"3+ bullet points justifying the selection based on compliance and value",
			},
		},
		required: ["best_vendor_email", "justification"],
	};

	const prompt = `
    Compare these vendor proposals against the RFP Requirements.
    Identify the BEST proposal based on Compliance (primary), Cost, and Timeline.
    
    RFP REQUIREMENTS:
    ${JSON.stringify(rfpData, null, 2)}

    PROPOSALS:
    ${JSON.stringify(proposalsData, null, 2)}

    Output the winner's email and 3+ detailed justification points explaining why they have the highest compliance/value.
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
