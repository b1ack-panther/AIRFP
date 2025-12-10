const nodemailer = require("nodemailer");
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const RFP = require("../models/RFP");
const Proposal = require("../models/Proposal");
const aiService = require("./aiService");
const Vendor = require("../models/Vendor");

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

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

exports.sendRfpEmails = async (rfp, vendors) => {
	const subject = `RFP Invitation: ${rfp.title} [Ref:${rfp._id}]`;
	const body =
		rfp.mail_body ||
		`Dear Vendor,\n\nWe are inviting you to submit a proposal.\n\nRequirements:\n${rfp.original_prompt}\n\nPlease reply to this email with your quote.`;

	const promises = vendors.map((vendor) => {
		return transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: vendor.email,
			subject: subject,
			text: body,
		});
	});

	await Promise.all(promises);
	console.log(`Sent emails to ${vendors.length} vendors.`);
};

exports.checkInboxForResponses = async () => {
	console.log("Checking Inbox for Vendor Responses...");

	try {
		const connection = await imaps.connect(imapConfig);
		connection.on("error", (err) =>
			console.error("IMAP Connection Error:", err)
		);

		await connection.openBox("INBOX");

		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const searchCriteria = ["UNSEEN", ["SINCE", oneWeekAgo]];
		const fetchOptions = {
			bodies: ["HEADER.FIELDS (SUBJECT FROM)", "TEXT"],
			markSeen: true,
		};

		const messages = await connection.search(searchCriteria, fetchOptions);
		if (!messages.length) {
			console.log("No new messages.");
			return;
		}

		for (const item of messages) {
			const textPart = item.parts.find((p) => p.which === "TEXT");
			const headerPart = item.parts.find(
				(p) => p.which === "HEADER.FIELDS (SUBJECT FROM)"
			);
			if (!textPart || !headerPart) continue;

			const subject = headerPart.body.subject?.[0] || "";
			const from = headerPart.body.from?.[0] || "";
			const textBody = textPart.body;

			const match = subject.match(/\[Ref:([a-f0-9]{24})\]/);
			if (!match) continue;

			const rfpId = match[1];
			const rfp = await RFP.findById(rfpId);
			if (!rfp) continue;

			const cleanEmail =
				(from.match(/<(.+)>/) || [null, from])[1]?.trim() || from.trim();

			const vendor = await Vendor.findOne({ email: cleanEmail });
			if (!vendor) {
				console.log(`Vendor not found: ${cleanEmail}`);
				continue;
			}

			console.log(`Parsing proposal from ${vendor.email}`);
			const extractedData = await aiService.extractProposalData(
				textBody,
				rfp.requirements
			);

			const proposal = await Proposal.findOne({
				rfp: rfp._id,
				vendor: vendor._id,
			});

			if (!proposal) {
				console.log(`Proposal not found for vendor ${vendor.email}`);
				continue;
			}

			proposal.status = "parsed";
			proposal.received_at = new Date();
			proposal.extracted_data = extractedData.extracted_data;
			proposal.compliance = extractedData.compliance;
			proposal.timeline = extractedData.timeline;
			await proposal.save();

			if (rfp.status !== "responses") {
				rfp.status = "responses";
				await rfp.save();
			}

			const parsedCount = await Proposal.countDocuments({
				rfp: rfp._id,
				status: "parsed",
			});

			if (parsedCount >= 2) {
				console.log(`Triggering AI comparison for RFP ${rfp._id}`);
				const proposals = await Proposal.find({ rfp: rfp._id }).populate(
					"vendor"
				);

				const proposalsData = proposals.map((p) => ({
					proposal_id: p._id.toString(),
					vendor_name: p.vendor.name,
					vendor_email: p.vendor.email,
					total_cost: p.extracted_data.reduce(
						(sum, item) => sum + item.price,
						0
					),
					delivery_timeline: p.timeline,
					compliance_score: p.compliance,
					extracted_items: p.extracted_data,
				}));

				const result = await aiService.compareProposals(
					{
						requirements: rfp.requirements,
						budget: rfp.total_budget,
						timeline: rfp.timeline,
					},
					proposalsData
				);

				if (result?.best_proposal_id) {
					rfp.best_proposal_id = result.best_proposal_id;
					rfp.justification = result.justification;
					await rfp.save();
				}
			}
		}

		connection.end();
	} catch (err) {
		console.error("IMAP Processing Error:", err);
	} finally {
		console.log("IMAP job completed.");
	}
};

