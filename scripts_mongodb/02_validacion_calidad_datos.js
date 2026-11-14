
/*
 EP2 - ContentFlow - Forma A
 Archivo: 02_validacion_calidad_datos.js

 Objetivo:
 Detectar publicaciones cuya fecha es anterior
 a la fecha de registro de su autor.

 Solo lectura: no modifica documentos.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");

print("\nVALIDACION DE CALIDAD DE DATOS");

const inconsistencias = contentflow.publicaciones.aggregate([
  {
    $lookup: {
      from: "usuarios",
      localField: "usuario_id",
      foreignField: "_id",
      as: "autor"
    }
  },
  { $unwind: "$autor" },
  {
    $match: {
      $expr: {
        $lt: [
          "$fecha_publicacion",
          "$autor.fecha_registro"
        ]
      }
    }
  },
  {
    $project: {
      _id: 1,
      usuario_id: 1,
      fecha_publicacion: 1,
      fecha_registro_autor: "$autor.fecha_registro"
    }
  },
  { $sort: { fecha_publicacion: 1 } }
]).toArray();

print("\nTOTAL DE INCONSISTENCIAS CRONOLOGICAS:");
print(inconsistencias.length);

print("\nPRIMERAS 10 PUBLICACIONES DETECTADAS:");
printjson(inconsistencias.slice(0, 10));

print("\nOBSERVACION:");
print(
  "Las publicaciones detectadas requieren revision. " +
  "No se modificaron las fechas originales."
);
