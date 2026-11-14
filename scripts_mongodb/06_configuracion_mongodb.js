
/*
 EP2 ContentFlow - Forma A
 Archivo: 06_configuracion_mongodb.js

 Verificacion de configuracion de MongoDB Atlas.
 Solo lectura: no crea ni modifica documentos.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");

print("\nCONFIGURACION CONTENTFLOW");
print("Base de datos: ContentFlowDB");

const colecciones = [
  "usuarios",
  "publicaciones",
  "reacciones",
  "comentarios",
  "campanas"
];

print("\nCOLECCIONES Y DOCUMENTOS");

colecciones.forEach(nombre => {
  const existe = contentflow
    .getCollectionNames()
    .includes(nombre);

  printjson({
    coleccion: nombre,
    existe: existe,
    documentos: existe
      ? contentflow.getCollection(nombre).countDocuments({})
      : 0
  });
});

print("\nINDICES DE PUBLICACIONES");
printjson(contentflow.publicaciones.getIndexes());

print("\nINDICES DE REACCIONES");
printjson(contentflow.reacciones.getIndexes());

print("\nVERIFICACION DE CONECTIVIDAD");
printjson(contentflow.runCommand({ ping: 1 }));

print("\nFIN DE VERIFICACION");
