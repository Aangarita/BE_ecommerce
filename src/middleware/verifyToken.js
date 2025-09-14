import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//Middleware para validar un jwt
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send("token requerido");
  };

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("token invalido");
  }
};

export default verifyToken;