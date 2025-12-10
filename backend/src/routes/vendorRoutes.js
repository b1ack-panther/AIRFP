const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");

router.get("/", vendorController.getAllVendors);
const validate = require("../middleware/validate");
const { createVendorSchema } = require("../validators/vendorSchema");

router.post("/", validate(createVendorSchema), vendorController.createVendor);
router.put("/:id", validate(createVendorSchema), vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);

module.exports = router;
