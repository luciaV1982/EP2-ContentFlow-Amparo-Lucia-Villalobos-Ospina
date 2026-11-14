
/*
 EP2 - ContentFlow - Forma A
 Archivo: 05_transformaciones_fechas.js

 Objetivo:
 Verificar los tipos BSON de los campos de fecha
 despues de la transformacion realizada en la EP2.

 IMPORTANTE:
 Script de solo lectura.
 No modifica ningun documento original.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");

print("\nVALIDACION DE TRANSFORMACIONES DE FECHAS");

// Campos de fecha conocidos de la evaluacion
const validaciones = [
  {
    coleccion: "usuarios",
    campo: "fecha_registro"
  },
  {
    coleccion: "publicaciones",
    campo: "fecha_publicacion"
  }
];

validaciones.forEach(({ coleccion, campo }) => {
  const datos = contentflow
    .getCollection(coleccion)
    .aggregate([
      {
        $group: {
          _id: { $type: "$" + campo },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
    .toArray();

  print("\nColeccion: " + coleccion);
  print("Campo: " + campo);
  printjson(datos);

  const totalFechas = datos
    .filter(d => d._id === "date")
    .reduce((total, d) => total + d.cantidad, 0);

  print("Documentos con fecha BSON Date: " + totalFechas);
});

print("\nNOTA METODOLOGICA");
print(
  "Las fechas originales fueron convertidas " +
  "previamente a BSON Date durante la evaluacion."
);

print(
  "Este archivo valida los tipos almacenados " +
  "y no repite las operaciones de actualizacion."
);

print("\nFIN DE VALIDACION DE FECHAS");
