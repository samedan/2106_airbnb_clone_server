const express = require("express");
const router = express.Router();
const { onlyAuthUser } = require("../controllers/users");
const {
  getRentals,
  getRentalById,
  createRental,
  getUserRentals,
  deleteRental,
} = require("../controllers/rentals");

// GET ALL rentals
router.get("/", getRentals);

// GET user rentals
router.get("/me", onlyAuthUser, getUserRentals);

// GET one Rental By Id
router.get("/:rentalId", getRentalById);

// POST
router.post("/", onlyAuthUser, createRental);

// DELETE
router.delete("/:rentalId", onlyAuthUser, deleteRental);

module.exports = router;
