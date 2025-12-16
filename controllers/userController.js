import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

// Correção do caminho ABSOLUTO da pasta database
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, "..", "database", "users.json");

const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

// leitura segura
const readUsers = () => {
  if (!fs.existsSync(usersPath)) return [];
  try {
    const raw = fs.readFileSync(usersPath, "utf-8");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// salvar
const saveUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

// register
export const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha name, email e password" });
  }

  const users = readUsers();

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email já cadastrado" });
  }

  const hashed = bcrypt.hashSync(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
  };

  users.push(newUser);
  saveUsers(users);

  return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
};

// login
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "Usuário não encontrado" });
  }

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(400).json({ message: "Senha incorreta" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};
