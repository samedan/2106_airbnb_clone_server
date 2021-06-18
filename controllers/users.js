const User = require("../models/users");

exports.login = (req, res) => {
  return res.json({ message: "Login" });
};

exports.register = (req, res) => {
  const { username, email, password, passwordConfirmation } = req.body;
  if (!password || !email) {
    return res.status(422).send({
      errors: [
        {
          title: "Missing data",
          detail: "Email or Password is missing",
        },
      ],
    });
  }

  if (password !== passwordConfirmation) {
    return res.status(422).send({
      errors: [
        {
          title: "Invalid password",
          detail: "Passwords do not match",
        },
      ],
    });
  }

  // check is user exists
  User.findOne({ email: email }, (error, existingUser) => {
    if (error) {
      return res.status(422).send({
        errors: [
          {
            title: "DB Error",
            detail: "Oops, something went wrong",
          },
        ],
      });
    }
    if (existingUser) {
      return res.status(422).send({
        errors: [
          {
            title: "Invalid email",
            detail: "User with this email already exists",
          },
        ],
      });
    }

    const user = new User({ username, email, password });
    user.save((error) => {
      if (error) {
        return res.status(422).send({
          errors: [
            {
              title: "DB Error",
              detail: "Oops, something went wrong",
            },
          ],
        });
      }
      return res.json({ status: "registered with success" });
    });
  });
};
