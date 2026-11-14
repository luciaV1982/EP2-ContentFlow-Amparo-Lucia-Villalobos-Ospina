require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());


/*
 IE11 - Registro de actividad HTTP
 Permite identificar fecha, metodo, ruta,
 codigo de respuesta y tiempo de ejecucion.
*/
app.use((req, res, next) => {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;

    console.log(
      `[${new Date().toISOString()}] ` +
      `${req.method} ${req.originalUrl} ` +
      `HTTP ${res.statusCode} - ${duracion}ms`
    );
  });

  next();
});

const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME || "ContentFlowDB";
const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("ERROR: Falta MONGODB_URI en el archivo .env");
  process.exit(1);
}

const client = new MongoClient(URI);
let db;

app.get("/api/health", async (req, res) => {
  try {
    await db.command({ ping: 1 });

    res.status(200).json({
      estado: "OK",
      mensaje: "API ContentFlow conectada a MongoDB Atlas",
      base_datos: DB_NAME
    });
  } catch (error) {
    console.error("Error de conectividad:", error.message);

    res.status(503).json({
      estado: "ERROR",
      mensaje: "No se pudo conectar a MongoDB"
    });
  }
});


app.get("/api/usuarios", async (req, res) => {
  try {
    const pagina = Number(req.query.pagina || 1);
    const limite = Number(req.query.limite || 10);

    if (
      !Number.isInteger(pagina) ||
      !Number.isInteger(limite) ||
      pagina < 1 ||
      limite < 1 ||
      limite > 100
    ) {
      return res.status(400).json({
        error: "La pagina debe ser positiva y el limite entre 1 y 100"
      });
    }

    const usuarios = await db.collection("usuarios")
      .find({})
      .skip((pagina - 1) * limite)
      .limit(limite)
      .toArray();

    const total = await db.collection("usuarios")
      .countDocuments({});

    res.status(200).json({
      total,
      pagina,
      limite,
      usuarios
    });

  } catch (error) {
    console.error("Error consultando usuarios:", error.message);

    res.status(500).json({
      error: "Error al consultar usuarios"
    });
  }
});


app.get("/api/publicaciones", async (req, res) => {
  try {
    const { categoria, tipo, desde } = req.query;
    const pagina = Number(req.query.pagina ?? 1);
    const limite = Number(req.query.limite ?? 10);

    if (
      !Number.isInteger(pagina) ||
      !Number.isInteger(limite) ||
      pagina < 1 ||
      limite < 1 ||
      limite > 100
    ) {
      return res.status(400).json({
        error: "Parametros de paginacion invalidos"
      });
    }

    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (tipo) filtro.tipo = tipo;

    if (desde !== undefined) {
      const fecha = new Date(desde);

      if (Number.isNaN(fecha.getTime())) {
        return res.status(400).json({
          error: "Fecha invalida. Utilice formato YYYY-MM-DD"
        });
      }

      filtro.fecha_publicacion = { $gte: fecha };
    }

    const coleccion = db.collection("publicaciones");

    const publicaciones = await coleccion
      .find(filtro)
      .sort({ fecha_publicacion: -1, _id: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite)
      .toArray();

    const total = await coleccion.countDocuments(filtro);

    res.status(200).json({
      total,
      pagina,
      limite,
      filtros: { categoria, tipo, desde },
      publicaciones
    });

  } catch (error) {
    console.error("Error consultando publicaciones:", error.message);

    res.status(500).json({
      error: "Error interno al consultar publicaciones"
    });
  }
});


app.post("/api/usuarios", async (req, res) => {
  try {
    const { _id, nombre, correo, pais, genero, dispositivo } = req.body;

    if (
      typeof _id !== "string" || !_id.trim() ||
      typeof nombre !== "string" || !nombre.trim() ||
      typeof correo !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      return res.status(400).json({
        error: "ID, nombre y correo valido son obligatorios"
      });
    }

    const nuevoUsuario = {
      _id: _id.trim(),
      nombre: nombre.trim(),
      correo: correo.trim(),
      pais: pais || "No especificado",
      genero: genero || "No especificado",
      fecha_registro: new Date(),
      dispositivo: dispositivo || "Desktop"
    };

    await db.collection("usuarios").insertOne(nuevoUsuario);

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Ya existe un usuario con ese identificador"
      });
    }

    console.error("Error creando usuario:", error.message);

    res.status(500).json({
      error: "Error interno al crear usuario"
    });
  }
});


app.patch("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, pais, dispositivo } = req.body;

    const cambios = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || !nombre.trim()) {
        return res.status(400).json({
          error: "El nombre debe ser un texto no vacio"
        });
      }
      cambios.nombre = nombre.trim();
    }

    if (pais !== undefined) {
      if (typeof pais !== "string" || !pais.trim()) {
        return res.status(400).json({
          error: "El pais debe ser un texto no vacio"
        });
      }
      cambios.pais = pais.trim();
    }

    if (dispositivo !== undefined) {
      if (typeof dispositivo !== "string" || !dispositivo.trim()) {
        return res.status(400).json({
          error: "El dispositivo debe ser un texto no vacio"
        });
      }
      cambios.dispositivo = dispositivo.trim();
    }

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({
        error: "Debe proporcionar al menos un campo valido"
      });
    }

    const resultado = await db.collection("usuarios").updateOne(
      { _id: id },
      { $set: cambios }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const usuario = await db.collection("usuarios").findOne({
      _id: id
    });

    res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      usuario
    });

  } catch (error) {
    console.error("Error actualizando usuario:", error.message);
    res.status(500).json({
      error: "Error interno al actualizar usuario"
    });
  }
});


app.delete("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Proteger los datos originales de la evaluación
    if (!["user_API_EP2_001", "user_API_DELETE_EP2"].includes(id)) {
      return res.status(403).json({
        error: "Solo se permite eliminar usuarios de prueba de la API"
      });
    }

    const resultado = await db.collection("usuarios").deleteOne({
      _id: id
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Usuario eliminado correctamente",
      usuario_id: id,
      eliminados: resultado.deletedCount
    });

  } catch (error) {
    console.error("Error eliminando usuario:", error.message);

    res.status(500).json({
      error: "Error interno al eliminar usuario"
    });
  }
});


/*
 POST /api/publicaciones
 Crear una publicacion temporal para pruebas de integracion.
*/
app.post("/api/publicaciones", async (req, res) => {
  try {
    const {
      _id,
      usuario_id,
      contenido,
      categoria,
      hashtags,
      tipo
    } = req.body;

    // Proteger los documentos originales
    if (_id !== "pub_API_EP2_001") {
      return res.status(403).json({
        error: "Solo se permite crear la publicacion temporal autorizada"
      });
    }

    // Validar campos obligatorios
    if (
      typeof usuario_id !== "string" ||
      !usuario_id.trim() ||
      typeof contenido !== "string" ||
      !contenido.trim() ||
      typeof categoria !== "string" ||
      !categoria.trim() ||
      typeof tipo !== "string" ||
      !tipo.trim()
    ) {
      return res.status(400).json({
        error: "Faltan campos obligatorios o contienen valores invalidos"
      });
    }

    // Validar hashtags
    if (
      !Array.isArray(hashtags) ||
      !hashtags.every(
        h => typeof h === "string" && h.trim().length > 0
      )
    ) {
      return res.status(400).json({
        error: "hashtags debe ser un arreglo de textos no vacios"
      });
    }

    // Verificar que el autor exista
    const autor = await db.collection("usuarios").findOne({
      _id: usuario_id
    });

    if (!autor) {
      return res.status(400).json({
        error: "El usuario_id no existe en la coleccion usuarios"
      });
    }

    const publicacion = {
      _id,
      usuario_id,
      contenido: contenido.trim(),
      fecha_publicacion: new Date(),
      categoria: categoria.trim(),
      hashtags: hashtags.map(h => h.trim()),
      tipo: tipo.trim()
    };

    await db.collection("publicaciones").insertOne(publicacion);

    return res.status(201).json({
      mensaje: "Publicacion creada correctamente",
      publicacion
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Ya existe una publicacion con ese identificador"
      });
    }

    console.error("Error creando publicacion:", error.message);

    return res.status(500).json({
      error: "Error interno al crear publicacion"
    });
  }
});

async function iniciarServidor() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    await db.command({ ping: 1 });

    console.log("Conexion exitosa a MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`API ContentFlow funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar la API:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
