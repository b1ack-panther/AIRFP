require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const rfpRoutes = require("./src/routes/rfpRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes");
const proposalRoutes = require("./src/routes/proposalRoutes");
const emailService = require("./src/services/emailService");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/rfps", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);

// Root Endpoint
app.get("/", (req, res) => {
	res.send("AIRPF Backend is Running");
});

// Start Server
try {
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
		// Seed vendors only if needed, but we now have a full CRUD API so maybe we don't need to auto-seed every restart?
		// Leaving it for now as per previous logic, but ideally we should check if vendors exist.
		console.log("🔄 Email Polling Service Started (Interval: 60s)");
		setInterval(() => {
			emailService.checkInboxForResponses();
		}, 60000);
	});
} catch (err) {
	console.error(err);
}
