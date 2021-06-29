const express = require("express");
const router = express.Router();
const { onlyAuthUser } = require("../controllers/users");
const {
  getRentals,
  getRentalById,
  createRental,
} = require("../controllers/rentals");

// GET ALL rentals
router.get("/", getRentals);

// GET one Rental By Id
router.get("/:rentalId", getRentalById);

// POST
router.post("/", onlyAuthUser, createRental);

module.exports = router;
