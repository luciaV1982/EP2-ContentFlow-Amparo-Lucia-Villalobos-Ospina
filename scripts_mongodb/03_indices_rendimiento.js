
/*
 EP2 - ContentFlow - Forma A
 Archivo: 03_indices_rendimiento.js

 Objetivo:
 Verificar el uso de los índices mediante
 explain("executionStats").

 Solo lectura: no crea ni elimina índices,
 ni modifica documentos.
*/

const contentflow = db.getSiblingDB("ContentFlowDB");

print("\nPRUEBA 1 - INDICE DE CATEGORIA");

print("\nIndice esperado: idx_publicaciones_categoria");

print("\nIndices existentes:");
printjson(contentflow.publicaciones.getIndexes());

print("\nEstadisticas de ejecucion:");

const resultadoCategoria = contentflow.publicaciones
  .find({ categoria: "Tecnología" })
  .hint("idx_publicaciones_categoria")
  .explain("executionStats");

printjson({
  indice: "idx_publicaciones_categoria",
  documentos_examinados:
    resultadoCategoria.executionStats.totalDocsExamined,
  claves_examinadas:
    resultadoCategoria.executionStats.totalKeysExamined,
  documentos_devueltos:
    resultadoCategoria.executionStats.nReturned,
  tiempo_ms:
    resultadoCategoria.executionStats.executionTimeMillis
});

print("\nPRUEBA 2 - INDICE DE REACCIONES");

print("\nIndice esperado: idx_reacciones_publicacion_id");

print("\nIndices existentes:");
printjson(contentflow.reacciones.getIndexes());

print("\nEstadisticas de ejecucion:");

const reaccionEjemplo = contentflow.reacciones.findOne(
  {},
  { publicacion_id: 1 }
);

if (reaccionEjemplo) {
  const resultadoReacciones = contentflow.reacciones
    .find({ publicacion_id: reaccionEjemplo.publicacion_id })
    .hint("idx_reacciones_publicacion_id")
    .explain("executionStats");

  printjson({
    indice: "idx_reacciones_publicacion_id",
    publicacion_id: reaccionEjemplo.publicacion_id,
    documentos_examinados:
      resultadoReacciones.executionStats.totalDocsExamined,
    claves_examinadas:
      resultadoReacciones.executionStats.totalKeysExamined,
    documentos_devueltos:
      resultadoReacciones.executionStats.nReturned,
    tiempo_ms:
      resultadoReacciones.executionStats.executionTimeMillis
  });
} else {
  print("No se encontraron reacciones para evaluar.");
}

print("\nRESULTADOS HISTORICOS DE LA EVALUACION");
print("Categoria: 500 -> 111 documentos examinados (77.8%)");
print("Reacciones: 500 -> 4 documentos examinados (99.2%)");

print("\nFIN DE PRUEBAS DE RENDIMIENTO");
