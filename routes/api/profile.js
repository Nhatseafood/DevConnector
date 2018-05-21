const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load profile model
const Profile = require("../../models/Profile");
// load user profile
const user = require("../../models/User");

// @route GET api/profile/test
// @description test profile route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: " Profile Works" })
);

// @route GET api/profile
// @description get current users profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const errors = {};

    Profile.findOne({ user: request.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return response.status(404).json(errors);
        }
        response.json(profile);
      })
      .catch(err => response.status(404).json(err));
  }
);

module.exports = router;
