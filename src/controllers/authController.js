import authService from "../services/authService.js";

const register = async (req, res) => {
  const body = req.body;
  const data = await authService.register(body);
  res.send(data);
};

const login = async (req, res) => {
  const body = req.body;
  const data = await authService.login(body);
  if (data.respuesta == "fail") {
    res.status(401).send(data)
    return;
  }
  res.send(data);
};

const getUser = async (req, res) => {
  try {
    const data = await authService.getUser(Number(req.user.id));
    if (!data) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error en getUser:", error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

const updateUser = async (req, res) => {
  const body = req.body;
  try {
    const data = await authService.updateUser(req.user.id, body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

const changeRole = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "No tienes permisos" });
  }

  const { id } = req.params;
  const { role } = req.body;
  const data = await authService.changeRole(id, role);
  res.send(data);
};


export default {
  register,
  login,
  getUser,
  updateUser,
  changeRole,
}