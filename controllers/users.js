const User = require("../models/users");
const jwt = require("jsonwebtoken");
const config = require("../config/dev");

exports.login = (req, res) => {
  const { email, password } = req.body;
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
  User.findOne({ email }, (error, foundUser) => {
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
    if (!foundUser) {
      return res.status(422).send({
        errors: [
          {
            title: "Invalid email",
            detail: "User with provided email doesn't exist",
          },
        ],
      });
    }
    // from models
    if (foundUser.hasSamePassword(password)) {
      // Success, Generate JWT Token
      const token = jwt.sign(
        {
          sub: foundUser.id,
          username: foundUser.username,
        },
        config.JWT_SECRET,
        { expiresIn: "2h" }
      );
      return res.json(token);
    } else {
      return res.status(422).send({
        errors: [
          {
            title: "Invalid password",
            detail: "Please provide valid credentials",
          },
        ],
      });
    }
  });
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

exports.onlyAuthUsers = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const decodedToken = parseToken(token);
    if (!decodedToken) {
      return notAuthorized(res);
    }

    User.findById(decodedToken.sub, (error, foundUser) => {
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
      // SUCCESS Path
      if (foundUser) {
        res.locals.user = foundUser;
        next();
      } else {
        return notAuthorized(res);
      }
    });
  } else {
    return notAuthorized(res);
  }
};

function parseToken(token) {
  try {
    return jwt.verify(token.split(" ")[1], config.JWT_SECRET) || null;
  } catch (error) {
    return null;
  }
}

function notAuthorized(res) {
  return res.status(401).send({
    errors: [
      {
        title: "Not authorized",
        message: "You need to Login to gain access",
      },
    ],
  });
}
