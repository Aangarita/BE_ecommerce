import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const register = async (body) => {
  const pass = await hashPassword(body.password);
  const data = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: pass,
    },
  });

  // eliminar password antes de devolver
  const { password: _, ...userWithoutPass } = data;
  return userWithoutPass;
};

const login = async (body) => {
  const {email, password} = body;

  //Buscamos por email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  //Si no existe el usuario
  if (!user) {
    return { statusCode: 404, respuesta: "fail", message: "Usuario no encontrado" };
  }

  //Compara password ingresado con el hash guardado en la BD
  const match = await comparePassword(password, user.password);
  if (!match) {
    return { statusCode: 401, respuesta: "fail", message: "Password incorrecto" };
  }

  //Eliminar password antes de devolver el usuario
  const { password: _, ...userWithoutPass } = user;

  //Generar token con la informacion minima
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
  return { 
    statusCode: 200,
    respuesta: "success", 
    token, 
    user: userWithoutPass 
  };
};

const getUser = async (id) => {
  const data = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return data;
};

const updateUser = async (id, body) => {
  const pass = body.password ? await hashPassword(body.password) : undefined;
  const data = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      ...(pass && { password: pass }) // solo actualiza si hay password
    },
  });
  return data;
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  return passwordHash;
};

const comparePassword = async (passwordBody, passwordBd) => {
  const match = await bcrypt.compare(passwordBody, passwordBd);
  return match;
};

const changeRole = async (id, role) => {
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: { role },
  });
};


export default {
  register,
  login,
  getUser,
  updateUser,
  changeRole,
};

