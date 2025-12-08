const nodemailer = require("nodemailer");
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const RFP = require("../models/RFP");
const Proposal = require("../models/Proposal");
const aiService = require("./aiService");

// --- SENDER CONFIG ---
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// --- RECEIVER CONFIG (IMAP) ---
const imapConfig = {
	imap: {
		user: process.env.EMAIL_USER,
		password: process.env.EMAIL_PASS,
		host: process.env.IMAP_HOST,
		port: 993,
		tls: true,
		authTimeout: 3000,
		tlsOptions: { rejectUnauthorized: false },
	},
};

/**
 * Sends RFP emails to a list of vendors
 */
exports.sendRfpEmails = async (rfp, vendors) => {
	const subject = `RFP Invitation: ${rfp.title} [Ref:${rfp._id}]`;
	const body = `Dear Vendor,\n\nWe are inviting you to submit a proposal.\n\nRequirements:\n${rfp.original_prompt}\n\nPlease reply to this email with your quote.`;

	const promises = vendors.map((vendor) => {
		return transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: vendor.email,
			subject: subject,
			text: body,
		});
	});

	await Promise.all(promises);
	console.log(`📧 Sent emails to ${vendors.length} vendors.`);
};

/**
 * Connects to IMAP, checks for UNSEEN emails, and parses them
 */
exports.checkInboxForResponses = async () => {
	console.log("📥 Checking Inbox for Vendor Responses...");

	imaps
		.connect(imapConfig)
		.then((connection) => {
			return connection.openBox("INBOX").then(() => {
				const oneWeekAgo = new Date();
				oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
				const searchCriteria = ["UNSEEN", ["SINCE", oneWeekAgo]];
				const fetchOptions = {
					bodies: ["HEADER.FIELDS (SUBJECT FROM)", "TEXT"],
					markSeen: true,
				};

				return connection
					.search(searchCriteria, fetchOptions)
					.then((messages) => {
						if (messages.length === 0) {
							console.log("No new messages.");
							return;
						}

						const processingPromises = messages.map(async (item) => {
							const textPart = item.parts.find((part) => part.which === "TEXT");
							const headerPart = item.parts.find(
								(part) => part.which === "HEADER.FIELDS (SUBJECT FROM)"
							);

							if (!textPart || !headerPart) return;

							const subject = headerPart.body.subject[0];
							const from = headerPart.body.from[0];
							const textBody = textPart.body;

							const match = subject.match(/\[Ref:([a-f0-9]{24})\]/);
							if (match && match[1]) {
								const rfpId = match[1];
								console.log(`🔎 Found reply for RFP ID: ${rfpId} from ${from}`);

								const rfp = await RFP.findById(rfpId);
								if (rfp) {
									console.log("🤖 Parsing email content with Gemini...");
									const extractedData = await aiService.extractProposalData(
										textBody,
										rfp.comparison_columns
									);

									await Proposal.create({
										rfp_id: rfp._id,
										vendor_email: from,
										extracted_data: extractedData,
									});

									console.log("✅ Proposal Saved to Database!");
								}
							}
						});

						return Promise.all(processingPromises);
					});
			});
		})
		.catch((err) => {
			console.error("IMAP Error:", err);
		})
		.finally(() => {
			console.log("IMAP connection closed.");
		});
};
