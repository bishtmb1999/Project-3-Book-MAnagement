let jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authenticate = function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide token in header" });
    }

    let decodedToken = jwt.verify(token, "functionup-radon");
    if (!decodedToken) {
      return res
        .status(400)
        .send({ status: false, Msg: "Token is not correct" });
    }
    // storing the decoded token

    req.token = decodedToken;
    
    next();
  } catch (err) {
    res.status(400).send({
      status: false,
      msg: "Token is not in right format/Internal server error ",
    });
  }
};

const authorise = async function (req, res, next) {
  try {
    let { userId } = req.body;

    let checkData = await userModel.findOne({ _id: userId });
    if (!checkData) {
      return res.status(404).send({ status: false, message: "Invalid userId" });
    }

    if (checkData._id != req.token.userId) {
      return res
        .status(404)
        .send({ status: false, msg: "Authorization failed." });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, msg: "Internal server error" });
  }
};

module.exports = { authenticate, authorise };
