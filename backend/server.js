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

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/rfps", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);

app.get("/", (req, res) => {
	res.send("AIRPF Backend is Running");
});

const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

try {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);

		setInterval(() => {
			emailService.checkInboxForResponses();
		}, 60000);
	});
} catch (err) {
	console.error(err);
}
