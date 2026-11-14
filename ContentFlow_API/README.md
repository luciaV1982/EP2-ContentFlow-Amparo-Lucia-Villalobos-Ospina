# ContentFlow — API REST con MongoDB Atlas

**DUOC UC — Escuela de Informática y Telecomunicaciones**

**Asignatura:** Base de Datos No Relacionales  
**Evaluación:** Evaluación Parcial 2 (EP2) — Forma A  
**Estudiante:** Amparo Lucía Villalobos Ospina  
**Docente:**  Matias Humberto Quinchen Ortiz
**Sección:** BDY0101  
**Fecha:** Noviembre de 2026

**Tecnologías:** MongoDB Atlas, MongoDB Compass, Node.js, Express y JavaScript.

---

## Descripción

API REST desarrollada con Node.js, Express y MongoDB Atlas para la evaluación EP2 de Base de Datos No Relacionales.

Permite consultar publicaciones, administrar usuarios y validar solicitudes HTTP utilizando la base de datos `ContentFlowDB`.

## Tecnologías

- Node.js 24
- Express 5
- MongoDB Node.js Driver 7
- MongoDB Atlas
- dotenv

## Instalación

1. Abrir una terminal en la carpeta `ContentFlow_API`.
2. Instalar las dependencias:

   ```powershell
   npm.cmd install
   ```

3. Copiar `.env.example` a un archivo llamado `.env`.
4. Configurar la cadena de conexión de MongoDB Atlas con las credenciales correspondientes.
5. Iniciar el servidor:

   ```powershell
   npm.cmd start
   ```

6. Comprobar el funcionamiento en `http://localhost:3000/api/health`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP, por defecto 3000 |
| `DB_NAME` | Nombre de la base de datos: ContentFlowDB |
| `MONGODB_URI` | Cadena privada de conexión a MongoDB Atlas |

El archivo `.env` no debe compartirse ni incluirse en la entrega.

## Endpoints disponibles

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Verificar la conexión con MongoDB Atlas |
| GET | `/api/usuarios` | Consultar usuarios con paginación |
| GET | `/api/publicaciones` | Consultar publicaciones con filtros y paginación |
| POST | `/api/usuarios` | Crear un usuario |
| PATCH | `/api/usuarios/:id` | Actualizar nombre, país y dispositivo |
| DELETE | `/api/usuarios/:id` | Eliminar usuarios de prueba autorizados por identificador |

## Ejemplos de consultas

Consultar cinco usuarios de la segunda página:

`GET /api/usuarios?pagina=2&limite=5`

Consultar publicaciones de Tecnología:

`GET /api/publicaciones?categoria=Tecnolog%C3%ADa`

Filtrar publicaciones de tipo Video desde abril de 2025:

`GET /api/publicaciones?tipo=Video&desde=2025-04-01&limite=5`

### Crear un usuario

`POST /api/usuarios`

| POST | `/api/publicaciones` | Crear una publicación temporal con validación de autor y campos |

Ejemplo de cuerpo JSON:

```json
{
  "_id": "user_API_EP2_002",
  "nombre": "Usuario de Ejemplo",
  "correo": "ejemplo@contentflow.example",
  "pais": "Chile",
  "genero": "Otro",
  "dispositivo": "Desktop"
}
```

### Actualizar un usuario

`PATCH /api/usuarios/user_API_EP2_002`

```json
{
  "nombre": "Usuario Actualizado",
  "dispositivo": "Mobile"
}
```

### Eliminar un usuario de prueba

`DELETE /api/usuarios/user_API_EP2_002`

## Códigos HTTP

| Código | Significado |
|---|---|
| 200 | Consulta, actualización o eliminación exitosa |
| 201 | Usuario creado correctamente |
| 400 | Datos o parámetros inválidos |
| 403 | Eliminación no permitida |
| 404 | Usuario no encontrado |
| 409 | Identificador de usuario duplicado |
| 500 | Error interno |
| 503 | Error de conectividad en el endpoint de salud |

## Seguridad y validaciones

La API utiliza variables de entorno para gestionar la conexión a MongoDB Atlas.

Se implementaron validaciones para campos obligatorios, formato básico de correo electrónico, paginación, fechas y actualizaciones.

El endpoint DELETE restringe la eliminación a identificadores de prueba. Esta medida corresponde al laboratorio y no reemplaza un sistema de autenticación y autorización para producción.

La API incorpora un mecanismo de registro de actividad HTTP que permite identificar la fecha y hora de cada solicitud, el método utilizado, la ruta consultada, el código de respuesta y el tiempo de ejecución. Se comprobaron respuestas HTTP 200 y 400 mediante pruebas desde PowerShell y su correspondiente registro en la terminal del servidor.

El endpoint POST `/api/publicaciones` verifica la existencia del usuario autor, valida los campos obligatorios y los hashtags, y restringe la creación al identificador temporal `pub_API_EP2_001` para proteger los datos originales de la evaluación.

## Evidencias de pruebas

Se realizaron pruebas de conexión, consultas GET, filtros, paginación, creación POST, actualización PATCH, eliminación DELETE y respuestas ante solicitudes inválidas.

Las operaciones de prueba se verificaron directamente en MongoDB Atlas. Al finalizar, se confirmó que las cinco colecciones conservaban 500 documentos cada una, con un total de 2.500 documentos.