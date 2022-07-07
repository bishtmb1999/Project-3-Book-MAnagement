const  mongoose= require("mongoose");


const validateEnum = function validateEnum(value) {
    if (!value) {
      return false;
    }
  
    var titleEnum = ["Mr", "Mrs", "Miss"];
    if (titleEnum.includes(value)) {
      return true;
    }
  
    return false;
  };
  
  const validateNumber = function validateNumber(value) {
    if (typeof value == "number") {
      return true;
    }
    return false;
  };
  
  const validateString = function validateString(value) {
    // if (!value) {
    //   return false;
    // }
  
    if (typeof value == "string" && value.trim().length != 0) {
      return true;
    }
    return false;
  };
  
  const checkValue = function (value) {
    let arrValue = [];
    value.map((x) => {
      x = x.trim();
      if (x.length) arrValue.push(x);
    });
    return arrValue.length ? arrValue : false;
  };
  
  const convertToArray = function (value) {
    if (typeof value == "string") {
      value = value.trim();
      if (value) {
        return [value];
      }
    } else if (value?.length > 0) {
      return checkValue(value);
    }
    return false;
  };
  
  const validateEmail = function (value) {
    let re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    let validEmail = re.test(value);
  
    if (!validEmail) {
      return false;
    }
  
    return true;
  };
  
  const validatePassword = function (value) {
    let re = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/;
    let validPassword = re.test(value);
  
    if (!validPassword) {
      return false;
    }
  
    return true;
  };
  
  const validateRequest = function (value) {
    if (Object.keys(value).length == 0) {
      return false;
    } else return true;
  };
  let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}
const passwordLength = function (password) {
    if (password.length >= 8 && password.length <= 15) {
      return true;
    } else return false;
  };
  const isbnLength = function (value) {
    if (value.length >= 10 && value.length <= 13) {
      return true;
    } else return false;
  };
  
  
  module.exports = {
    validateString,
    convertToArray,
    checkValue,
    validateEmail,
    validatePassword,
    validateRequest,
    validateNumber,
    isValidObjectId,
    passwordLength,
    isbnLength 
  };