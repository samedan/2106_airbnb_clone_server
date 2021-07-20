const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getUserBookings,
  getReceivedBookings,
  deleteBooking,
} = require("../controllers/bookings");
const { isUserRentalOwner } = require("../controllers/rentals");
const { onlyAuthUser } = require("../controllers/users");

// GET
// /api/v1/bookings?rental="8772392sad79das8d"
router.get("", getBookings);
// 12 March -> 19 march
router.get("/me", onlyAuthUser, getUserBookings);
// 12 March -> 19 march
router.get("/received", onlyAuthUser, getReceivedBookings);

// POST Booking
// 'isUserRentalOwner' middleware in controllers/rentals.js
router.post("/", onlyAuthUser, isUserRentalOwner, createBooking);

// DELETE
// /api/v1/bookings/ihsniou_ç90_
router.delete("/:bookingId", onlyAuthUser, deleteBooking);

module.exports = router;
