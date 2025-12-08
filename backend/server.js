require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const rfpRoutes = require("./src/routes/rfpRoutes");
const emailService = require("./src/services/emailService");
const { seedVendors } = require("./src/controllers/rfpController");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api", rfpRoutes);

// Root Endpoint
app.get("/", (req, res) => {
	res.send("AIRPF Backend is Running");
});

// Start Server
try {
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
		seedVendors();
		console.log("🔄 Email Polling Service Started (Interval: 60s)");
		setInterval(() => {
			emailService.checkInboxForResponses();
		}, 60000);
	});
} catch (err) {
	console.error(err);
}
