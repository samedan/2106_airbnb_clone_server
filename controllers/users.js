const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../config/dev");

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.sendApiError({
      title: "Missing Data",
      detail: "Missing email or password",
    });
  }

  User.findOne({ email }, (error, foundUser) => {
    if (error) {
      return res.mongoError(error);
    }

    if (!foundUser) {
      return res.sendApiError({
        title: "Invalid Email",
        detail: "Invalid email or password",
      });
    }

    if (foundUser.hasSamePassword(password)) {
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
      return res.sendApiError({
        title: "Invalid Password",
        detail: "Invalid email or password",
      });
    }
  });
};

// REGISTER
exports.register = (req, res) => {
  const { username, email, password, passwordConfirmation } = req.body;

  if (!password || !email || !username) {
    return res.status(422).send({
      errors: [
        {
          title: "Missing Data",
          detail: "Missing username, email or password",
        },
      ],
    });
  }

  if (password !== passwordConfirmation) {
    return res.status(422).send({
      errors: [
        {
          title: "Invalid password",
          detail: "Password is not maching confirmation password!",
        },
      ],
    });
  }

  User.findOne({ email }, (error, existingUser) => {
    if (error) {
      return res.mongoError(error);
    }

    if (existingUser) {
      return res.status(422).send({
        errors: [
          {
            title: "Invalid Email",
            detail: "A user with provided email already exists!",
          },
        ],
      });
    }

    const user = new User({ username, email, password });
    user.save((error) => {
      if (error) {
        return res.mongoError(error);
      }

      return res.json({ status: "registered" });
    });
  });
};

exports.onlyAuthUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const decodedToken = parseToken(token);
    if (!decodedToken) {
      return notAuthorized(res);
    }

    User.findById(decodedToken.sub, (error, foundUser) => {
      if (error) {
        return res.mongoError(error);
      }

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
    return jwt.verify(token.split(" ")[1], config.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function notAuthorized(res) {
  return res.status(401).send({
    errors: [
      {
        title: "Not Authorized!",
        detail: "You need to log in to get an access!",
      },
    ],
  });
}
