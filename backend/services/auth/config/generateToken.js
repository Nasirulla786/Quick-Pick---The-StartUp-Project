import jwt from "jsonwebtoken";
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JSON_SECRET);
  if (!token) {
    console.error("Token cant be generate");
    return;
  }

  return token;
};


export default generateToken
