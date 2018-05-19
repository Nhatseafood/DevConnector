const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load INput Validation
const validateRegisterInput = require("../../validations/register");

// Load User Model
const User = require("../../models/User");

// @route GET api/users/test
// @description test users route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Users Works" })
);

// @route GET api/users/register
// @description Register route
// @access Public
router.post("/register", (request, response) => {
  const { errors, isValid } = validateRegisterInput(request.body);

  // CHeck Validation
  if (!isValid) {
    return response.status(400).json(errors);
  }

  User.findOne({ email: request.body.email }).then(user => {
    if (user) {
      return response.status(400).json({ email: "Email already exists" });
    } else {
      const avatar = gravatar.url(request.body.email, {
        s: "200", //size
        r: "pg", // rating
        d: "mm" // Default'
      });
      const newUser = new User({
        name: request.body.name,
        email: request.body.email,
        avatar: avatar,
        password: request.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => response.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET api/users/login
// @description Login User / Return token
// @access Public
router.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return response.status(404).json({ email: "User not found" });
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched

        const payload = { id: user.id, name: user.name, avatar: user.avatar }; // create JWT payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            response.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return response.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

// @route GET api/users/current
// @description Return current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    response.json({
      id: request.user.id,
      name: request.user.name,
      email: request.user.email
    });
  }
);
module.exports = router;
