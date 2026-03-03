import jwt from "jsonwebtoken";
export const generateToken = async (id, res) => {
  if(!process.env.JWT_SECRET){
   return console.log("jwt secret is missing");
  }
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("accessToken", token, {
  httpOnly: true,    // JS se invisible
  secure: true,      // HTTPS only
  sameSite: "none", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
})
// console.log(token)
  return token;
};


