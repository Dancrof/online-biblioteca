import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSONFilePreset } from "lowdb/node";
import { Service, isItem } from "json-server/lib/service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7h";

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "..", "database", "db.json");
const defaultData = { usuarios: [], libros: [], alquileres: [] };
const db = await JSONFilePreset(dbPath, defaultData);
const service = new Service(db);

/**
 * Genera un nuevo ID string incremental
 */
function generateId(collectionName) {
  const items = db.data[collectionName] || [];
  if (!Array.isArray(items) || items.length === 0) return "1";
  const maxId = items.reduce((max, item) => {
    const n = Number(item.id) || 0;
    return n > max ? n : max;
  }, 0);
  return String(maxId + 1);
}

const ROLE_ADMIN = "admin";
const ROLE_USER = "user";

/**
 * Genera un JWT para un usuario (incluye rol)
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    correo: user.correo,
    estado: user.estado,
    rol: user.rol === ROLE_ADMIN ? ROLE_ADMIN : ROLE_USER,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Middleware para proteger rutas que requieran autenticación.
 */
function authMiddleware(req, res, next) {
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    !req.path.startsWith("/auth")
  ) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  }
  next();
}

 /**
 * Rutas de autenticación: registro, login y perfil.
 * Registro y login devuelven token + usuario (sin contraseña).
 * Perfil GET/PATCH solo para el propio usuario (requiere token).
 */
router.post("/auth/register", async (req, res) => {
  try {
    const {
      cedula,
      nombreCompleo,
      apellidoCompleto,
      telefono,
      dirreccion,
      correo,
      contrasena,
    } = req.body || {};

    if (!cedula || !correo || !contrasena || !nombreCompleo || !apellidoCompleto) {
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios para el registro." });
    }

    const usuarios = db.data.usuarios || [];
    const existingCedula = usuarios.find((u) => u.cedula === cedula);
    const existingCorreo = usuarios.find((u) => u.correo === correo);

    if (existingCedula) {
      return res.status(400).json({
        message: "Ya existe un usuario con esta cédula.",
      });
    }

    if (existingCorreo) {
      return res.status(400).json({
        message: "Ya existe un usuario con este correo electrónico.",
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const newUser = {
      id: generateId("usuarios"),
      cedula,
      nombreCompleo,
      apellidoCompleto,
      telefono: telefono || "",
      dirreccion: dirreccion || "",
      correo,
      contrasena: hashedPassword,
      estado: true,
      rol: ROLE_USER,
    };

    usuarios.push(newUser);
    await db.write();

    const token = generateToken(newUser);

    const { contrasena: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error en /auth/register:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

/**
 * Login: verifica credenciales y devuelve token + usuario (sin contraseña).
 */
router.post("/auth/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body || {};

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña son obligatorios." });
    }

    const usuarios = db.data.usuarios || [];
    const user = usuarios.find((u) => u.correo === correo);

    if (!user || user.estado === false) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = generateToken(user);
    const { contrasena: _, ...userWithoutPassword } = user;
    if (!userWithoutPassword.rol) {
      userWithoutPassword.rol = user.rol === ROLE_ADMIN ? ROLE_ADMIN : ROLE_USER;
    }

    return res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error en /auth/login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

/**
 * GET /auth/me: devuelve datos del usuario logueado (sin contraseña).
 * Requiere token en Authorization header. Útil para validar token y mostrar perfil.
 */
router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
});

router.use(authMiddleware);

/**
 * Middleware: exige token y deja req.user. Usar en rutas de perfil (GET/PATCH /usuarios/:id).
 */
function requireAuthForProfile(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

/**
 * Middleware: solo permite acceso si el ID del token coincide con el ID del recurso.
 * Usar después de requireAuthForProfile en rutas como GET/PATCH /usuarios/:id.
 */
function requireOwnUser(req, res, next) {
  if (String(req.user?.id) !== String(req.params.id)) {
    return res.status(403).json({ message: "No autorizado para este recurso" });
  }
  next();
}

/** GET /usuarios/:id — solo el propio usuario (sin contraseña) */
router.get("/usuarios/:id", requireAuthForProfile, requireOwnUser, (req, res) => {
  const usuarios = db.data.usuarios || [];
  const user = usuarios.find((u) => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({});
  const { contrasena: _, ...safe } = user;
  return res.json(safe);
});

const ALLOWED_PROFILE_FIELDS = [
  "nombreCompleo",
  "apellidoCompleto",
  "telefono",
  "dirreccion",
  "correo",
  "contrasena",
];

/** PATCH /usuarios/:id — solo el propio usuario; campos permitidos y correo único */
router.patch("/usuarios/:id", requireAuthForProfile, requireOwnUser, async (req, res) => {
  try {
    const usuarios = db.data.usuarios || [];
    const index = usuarios.findIndex((u) => String(u.id) === String(req.params.id));
    if (index === -1) return res.status(404).json({});

    const updates = {};
    for (const key of ALLOWED_PROFILE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.correo) {
      const otro = usuarios.find(
        (u) => String(u.correo) === String(updates.correo).toLowerCase() && String(u.id) !== String(req.params.id)
      );
      if (otro) {
        return res.status(400).json({ message: "Ya existe un usuario con este correo electrónico." });
      }
      updates.correo = updates.correo.trim().toLowerCase();
    }
    if (updates.contrasena) {
      updates.contrasena = await bcrypt.hash(updates.contrasena, 10);
    }

    const updated = { ...usuarios[index], ...updates };
    usuarios[index] = updated;
    await db.write();

    const { contrasena: __, ...safe } = updated;
    return res.json(safe);
  } catch (error) {
    console.error("Error PATCH /usuarios/:id:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

/**
 * Middleware opcional: si hay token válido, establece req.user.
 * Útil para rutas que pueden funcionar con o sin autenticación.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Token inválido, pero continuamos sin req.user
    }
  }
  next();
}

/** GET /alquileres — solo del usuario logueado si hay token */
router.get("/alquileres", optionalAuth, (req, res) => {
  const query = { ...req.query };
  if (req.user?.id) {
    const isAdmin = req.user?.rol === ROLE_ADMIN;
    if (isAdmin) {
      const data = service.find("alquileres", query);
      return res.json(data);
    }
    // Filtrar por usuarioId del token (comparar como número)
    const userId = Number(req.user.id);
    const alquileres = db.data.alquileres || [];
    const filtered = alquileres.filter((a) => Number(a.usuarioId) === userId);
    // Aplicar paginación y otros filtros del query si existen
    const page = query._page ? Number(query._page) : 1;
    const limit = query._limit ? Number(query._limit) : filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    // Devolver con headers de paginación
    res.set("X-Total-Count", String(filtered.length));
    return res.json(paginated);
  }
  // Sin token: usar el servicio normal (pero esto no debería pasar si RequireAuth está activo)
  const data = service.find("alquileres", query);
  res.json(data);
});

/** POST /alquileres — fuerza usuarioId del token */
router.post("/alquileres", requireAuthForProfile, async (req, res) => {
  if (!isItem(req.body)) return res.status(400).json({});
  const body = { ...req.body };
  body.usuarioId = Number(req.user.id);
  const data = await service.create("alquileres", body);
  if (data === undefined) return res.status(404).json({});
  res.status(201).json(data);
});

// API REST (libros, usuarios, alquileres) usando el Service de json-server
function apiMiddleware(req, res, next) {
  const name = req.params.name;
  if (name === "auth" || !service.has(name)) {
    return res.status(404).json({});
  }
  next();
}

/** Rutas REST genéricas para libros, usuarios y alquileres */
router.get("/:name", apiMiddleware, (req, res) => {
  const data = service.find(req.params.name, req.query);
  res.json(data);
});

/** GET /:name/:id — devuelve 404 si no existe */
router.get("/:name/:id", apiMiddleware, (req, res) => {
  const data = service.findById(req.params.name, req.params.id, req.query);
  if (data === undefined) return res.status(404).json({});
  res.json(data);
});

/** POST /:name — crea nuevo item; devuelve 404 si la colección no existe */
router.post("/:name", apiMiddleware, async (req, res) => {
  if (!isItem(req.body)) return res.status(400).json({});
  const data = await service.create(req.params.name, req.body);
  if (data === undefined) return res.status(404).json({});
  res.status(201).json(data);
});

/** PUT /:name/:id — actualiza item completo; devuelve 404 si no existe */
router.put("/:name/:id", apiMiddleware, async (req, res) => {
  if (!isItem(req.body)) return res.status(400).json({});
  const data = await service.updateById(req.params.name, req.params.id, req.body);
  if (data === undefined) return res.status(404).json({});
  res.json(data);
});

/** PATCH /:name/:id — actualiza item parcialmente; devuelve 404 si no existe */
router.patch("/:name/:id", apiMiddleware, async (req, res) => {
  if (!isItem(req.body)) return res.status(400).json({});
  const data = await service.patchById(req.params.name, req.params.id, req.body);
  if (data === undefined) return res.status(404).json({});
  res.json(data);
});

/** DELETE /:name/:id — elimina item; devuelve 404 si no existe */
router.delete("/:name/:id", apiMiddleware, async (req, res) => {
  const dependent = req.query._dependent;
  const data = await service.destroyById(req.params.name, req.params.id, dependent);
  if (data === undefined) return res.status(404).json({});
  res.json(data);
});

/** Inicia el servidor en el puerto especificado */
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`API con JWT escuchando en http://localhost:${PORT}`);
});
