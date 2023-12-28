function isRequired(data) {
  let err = [];
  for (let [key, value] of Object.entries(data)) {
    // console.log(`${key} ${value}`);
    if (value == ""||value===undefined||value===null) {
      err.push(`${key} is required`);
    } else {
      if (key == "username") {
        err.push(isNameValid(key, value));
      } else if (key == "new_password"||key == "password") {
        err.push(isPasswordValid(key, value));
      } else if (key == "email") {
        err.push(isEmailValid(key, value));
      } else if (key == "phone") {
        err.push(isPhoneValid(key, value));
      } else if (key == "confirmPassword") {
        err.push(isEqual(data.password, value));
      } else if (key == "image") {
        err.push(isUrlValid(key, value));
      } else if (key == "first_name") {
        err.push(isUserNameValid(key, value));
      } else if (key == "emp_id") {
        err.push(isNumeric(key, value));
      } else if (key == "todayMenuItems") {
        err.push(isArray(key, value));
      }
    }
  }
  return err.filter((item) => item != true);
}
function isArray(key ,value) {
 if(Array.isArray(value)){
  return true;
 }else{
  return `${key} must be of array type`;
 }
}
function isNameValid(key, value) {
  if (!/^[a-zA-Z ]{3,30}$/.test(value)) {
    return `${key} can contain only capital and small alphabets ,white spaces and min 3 characters.`;
  }
  return true;
}

function isUserNameValid(key, value) {
  if (!/^[a-zA-Z]+$/.test(value)) {
    return `${key} can contain only capital and small alphabets ,white spaces and min 3 characters.`;
  }
  return true;
}
function isPasswordValid(key, value) {
  if (
    !/^(?=.*[0-9])(?=.*[- ?!@#$%^&*\/\\])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9- ?!@#$%^&*\/\\]{8,30}$/.test(
      value
    )
  ) {
    return `${key} must be combination of upper case, lower case, number and special character.`;
  } else {
    return true;
  }
}

function isEmailValid(key, value) {
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    )
  ) {
    return `Invalid ${key} format.`;
  }
  return true;
}

function isPhoneValid(key, value) {
  if (!/^[0-9]{10}$/.test(value)) {
    return `${key} must contain 10 numbers.`;
  }
  return true;
}

function isEqual(valueOne, valueTwo) {
  if (valueOne != valueTwo) {
    return `Confirm password and password field value must be same.`;
  }
  return true;
}

function isUrlValid(key, value) {
  if (!/(https?:\/\/.*\.(?:png|jpg))/.test(value)) {
    return `${key} must be a valid url`;
  }
  return true;
}

function isNumeric(key, value) {
  if (typeof value != "number") {
    return `${key} must be numeric only.`;
  }
  return true;
}

module.exports = {
  isRequired,
  isNameValid,
  isPasswordValid,
  isEmailValid,
  isPhoneValid,
  isEqual,
  isUrlValid,
  isNumeric,
};

// const validateRegister = (req, res, next)=>{

//   const {userName, emailAddress, password} = req.body;
//   const errors =[];

//   if(!userName||!emailAddress||!password) {
//     errors.push("Please fill all the required fields.")
//   }

//   if(errors.length>=1){
//     return res.status(400).json({error:errors})
//   }
//   next();
// }
// module.exports = {validateRegister}
