const express = require("express");
const router = express.Router();
const { onlyAuthUser } = require("../controllers/users");
const {
  getRentals,
  getRentalById,
  createRental,
  getUserRentals,
  deleteRental,
  updateRental,
  verifyUser,
} = require("../controllers/rentals");

// GET ALL rentals
router.get("/", getRentals);

// GET user rentals
router.get("/me", onlyAuthUser, getUserRentals);

// GET one Rental By Id
router.get("/:rentalId", getRentalById);

// GET Verify rental ID if User is Owner
router.get("/:rentalId/verify-user", onlyAuthUser, verifyUser);

// POST
router.post("/", onlyAuthUser, createRental);

// UPDATE
router.patch("/:rentalId", onlyAuthUser, updateRental);

// DELETE
router.delete("/:rentalId", onlyAuthUser, deleteRental);

module.exports = router;
