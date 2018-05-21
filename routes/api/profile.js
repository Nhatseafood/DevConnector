const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load validation
const validateProfileInput = require("../../validations/profile");
const validateExperienceInput = require("../../validations/experience");
const validateEducationInput = require("../../validations/education");

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
      .populate("user", ["name", "avatar"])
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
// @route GET api/profile/all
// @description get pall profile
// @access Public
router.get("/all", (request, response) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles || profiles.length === 0) {
        errors.noprofile = "There are no profiles";
        return response.status(404).json(errors);
      }
      response.json(profiles);
    })
    .catch(err =>
      response.status(404).json({ profile: "There are no profiles" })
    );
});

// @route GET api/profile/handle/:handle
// @description get profile by handle
// @access Public
router.get("/handle/:handle", (request, response) => {
  const errors = {};

  Profile.findOne({ handle: request.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err => response.status(404).json(err));
});

// @route GET api/profile/user/:user_id
// @description get profile by user id
// @access Public
router.get("/user/:user_id", (request, response) => {
  const errors = {};

  Profile.findOne({ user: request.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err =>
      response
        .status(404)
        .json({ profile: "There is no profile for this user" })
    );
});

// @route POST api/profile
// @description Create or Edit user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateProfileInput(request.body);

    // CHeck validation
    if (!isValid) {
      //Return any errors with 400 status
      return response.status(400).json(errors);
    }

    // Get Fields
    const profileFields = {};
    profileFields.user = request.user.id;
    if (request.body.handle) profileFields.handle = request.body.handle;
    if (request.body.company) profileFields.company = request.body.company;
    if (request.body.website) profileFields.website = request.body.website;
    if (request.body.location) profileFields.location = request.body.location;
    if (request.body.bio) profileFields.bio = request.body.bio;
    if (request.body.status) profileFields.status = request.body.status;
    if (request.body.githubusername)
      profileFields.githubusername = request.body.githubusername;
    //SKills split into array
    if (typeof request.body.skills !== "undefined") {
      profileFields.skills = request.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (request.body.youtube)
      profileFields.social.youtube = request.body.youtube;
    if (request.body.twitter)
      profileFields.social.twitter = request.body.twitter;
    if (request.body.facebook)
      profileFields.social.facebook = request.body.facebook;
    if (request.body.linkedin)
      profileFields.social.linkedin = request.body.linkedin;
    if (request.body.instagram)
      profileFields.social.instagram = request.body.instagram;

    Profile.findOne({ user: request.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: request.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => response.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            response.status(400).json(errors);
          }
          // Save profile
          new Profile(profileFields)
            .save()
            .then(profile => response.json(profile));
        });
      }
    });
  }
);

// @route POST api/profile/experience
// @description add experience to profile
// @access Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateExperienceInput(request.body);

    // CHeck validation
    if (!isValid) {
      //Return any errors with 400 status
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id }).then(profile => {
      const newExp = {
        title: request.body.title,
        company: request.body.company,
        location: request.body.location,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };

      // Add to experience array
      profile.experience.unshift(newExp);

      profile.save().then(profile => response.json(profile));
    });
  }
);

// @route POST api/profile/education
// @description add experience to profile
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateEducationInput(request.body);

    // CHeck validation
    if (!isValid) {
      //Return any errors with 400 status
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id }).then(profile => {
      const newEdu = {
        school: request.body.school,
        degree: request.body.degree,
        fieldofstudy: request.body.fieldofstudy,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };

      // Add to experience array
      profile.education.unshift(newEdu);

      profile.save().then(profile => response.json(profile));
    });
  }
);

module.exports = router;
