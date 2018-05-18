const express = require("express");
const router = express.Router();

// @route GET api/profile/test
// @description test profile route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: " Profile Works" })
);

module.exports = router;
