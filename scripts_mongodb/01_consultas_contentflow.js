
/*
 EP2 - ContentFlow - Forma A
 Archivo: 01_consultas_contentflow.js

 Consultas de lectura y agregacion.
 Ejecutar con mongosh sobre ContentFlowDB.
 No modifica documentos.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");

print("\nCONSULTA 1 - Publicaciones de Tecnologia");

printjson(
  contentflow.publicaciones.find(
    { categoria: "Tecnología" },
    {
      _id: 1,
      usuario_id: 1,
      categoria: 1,
      tipo: 1,
      fecha_publicacion: 1
    }
  ).sort({ fecha_publicacion: -1 }).limit(10).toArray()
);

print("\nCONSULTA 2 - Videos de Tecnologia desde abril 2025");

printjson(
  contentflow.publicaciones.find(
    {
      $and: [
        { categoria: "Tecnología" },
        { tipo: "Video" },
        {
          fecha_publicacion: {
            $gte: ISODate("2025-04-01T00:00:00Z")
          }
        }
      ]
    },
    {
      _id: 1,
      categoria: 1,
      tipo: 1,
      fecha_publicacion: 1
    }
  ).sort({ fecha_publicacion: -1 }).limit(10).toArray()
);

print("\nCONSULTA 3 - Publicaciones por categoria");

printjson(
  contentflow.publicaciones.aggregate([
    {
      $group: {
        _id: "$categoria",
        total_publicaciones: { $sum: 1 }
      }
    },
    { $sort: { total_publicaciones: -1 } }
  ]).toArray()
);

print("\nCONSULTA 4 - Usuarios con mas publicaciones");

printjson(
  contentflow.publicaciones.aggregate([
    {
      $group: {
        _id: "$usuario_id",
        total_publicaciones: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "_id",
        foreignField: "_id",
        as: "datos_usuario"
      }
    },
    { $unwind: "$datos_usuario" },
    {
      $project: {
        _id: 0,
        usuario_id: "$_id",
        nombre: "$datos_usuario.nombre",
        pais: "$datos_usuario.pais",
        total_publicaciones: 1
      }
    },
    { $sort: { total_publicaciones: -1 } },
    { $limit: 10 }
  ]).toArray()
);

print("\nCONSULTA 5 - Horarios de publicacion UTC");

printjson(
  contentflow.publicaciones.aggregate([
    {
      $group: {
        _id: { $hour: "$fecha_publicacion" },
        total_publicaciones: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        hora: "$_id",
        total_publicaciones: 1
      }
    },
    { $sort: { total_publicaciones: -1 } },
    { $limit: 10 }
  ]).toArray()
);

print("\nCONSULTA 6 - Publicaciones con mas reacciones");

printjson(
  contentflow.reacciones.aggregate([
    {
      $group: {
        _id: "$publicacion_id",
        total_reacciones: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "publicaciones",
        localField: "_id",
        foreignField: "_id",
        as: "publicacion"
      }
    },
    { $unwind: "$publicacion" },
    {
      $project: {
        _id: 0,
        publicacion_id: "$_id",
        categoria: "$publicacion.categoria",
        tipo: "$publicacion.tipo",
        total_reacciones: 1
      }
    },
    { $sort: { total_reacciones: -1 } },
    { $limit: 10 }
  ]).toArray()
);

print("\nCONSULTA 7 - Campanas con mas publicaciones asociadas");

printjson(
  contentflow.campanas.aggregate([
    {
      $project: {
        _id: 1,
        nombre: 1,
        objetivo: 1,
        total_publicaciones: {
          $size: "$publicaciones_asociadas"
        }
      }
    },
    { $sort: { total_publicaciones: -1 } },
    { $limit: 10 }
  ]).toArray()
);

print("\nFIN DE CONSULTAS CONTENTFLOW");
