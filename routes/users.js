const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/users");

// POST Login
router.post("/login", login);

// POST Register
router.post("/register", register);

module.exports = router;
