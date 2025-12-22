const express = require("express");
const router = express.Router();

const publicSettingsController = require("../controllers/publicSettingsController");

router.get("/", publicSettingsController.getPublicSettings);

module.exports = router;
