const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookings");
const { isUserRentalOwner } = require("../controllers/rentals");
const { onlyAuthUser } = require("../controllers/users");

// POST Booking
// 'isUserRentalOwner' middleware in controllers/rentals.js
router.post("/", onlyAuthUser, isUserRentalOwner, createBooking);

module.exports = router;
