
/*
 EP2 - ContentFlow - Forma A
 Archivo: 04_operaciones_crud.js

 Demostracion CRUD sobre un usuario temporal.
 No modifica usuarios originales.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");
const usuarios = contentflow.getCollection("usuarios");

const idPrueba = "user_SCRIPT_CRUD_EP2_001";

print("\nDEMOSTRACION CRUD CONTENTFLOW");

// Seguridad: no sobrescribir un usuario existente.
if (usuarios.findOne({ _id: idPrueba })) {
  throw new Error(
    "El usuario temporal ya existe. No se modificara."
  );
}

try {
  // CREATE
  print("\n1. CREATE - Insertar usuario temporal");

  printjson(
    usuarios.insertOne({
      _id: idPrueba,
      nombre: "Usuario Temporal CRUD",
      correo: "crud.ep2@example.com",
      pais: "Chile",
      genero: "Otro",
      dispositivo: "Desktop",
      fecha_registro: new Date()
    })
  );

  // READ
  print("\n2. READ - Consultar usuario");

  printjson(usuarios.findOne({ _id: idPrueba }));

  // UPDATE
  print("\n3. UPDATE - Actualizar usuario");

  printjson(
    usuarios.updateOne(
      { _id: idPrueba },
      {
        $set: {
          nombre: "Usuario CRUD Actualizado",
          dispositivo: "Mobile"
        }
      }
    )
  );

  print("\nUsuario despues de UPDATE:");
  printjson(usuarios.findOne({ _id: idPrueba }));

} finally {
  // DELETE
  print("\n4. DELETE - Eliminar usuario temporal");

  printjson(
    usuarios.deleteOne({ _id: idPrueba })
  );

  print("\nVerificacion final:");
  printjson(usuarios.findOne({ _id: idPrueba }));

  print("\nCantidad de usuarios:");
  print(usuarios.countDocuments({}));
}

print("\nFIN DE DEMOSTRACION CRUD");
