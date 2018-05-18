const express = require("express");
const router = express.Router();

// @route GET api/users/test
// @description test users route
// @access Public

router.get("/test", (request, response) =>
  response.json({ msg: "Users Works" })
);

module.exports = router;
