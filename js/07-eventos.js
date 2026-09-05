// Eventos y validaciones de los formularios.
formularioGrupo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const nombre = document.getElementById("nombreGrupo").value;
  if (nombre == "") { mostrarMensaje("mensajeGrupo", "Escribe un nombre para continuar.", true); }
  else { document.getElementById("tituloGrupo").innerHTML = nombre; document.getElementById("inicioAplicacion").classList.add("oculto"); document.getElementById("contenidoAplicacion").classList.remove("oculto"); }
});

formularioIntegrante.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const nombre = document.getElementById("nombreIntegrante").value;
  let repetido = false;
  let i;
  for (i = 0; i < integrantes.length; i++) { if (integrantes[i].toLowerCase() == nombre.toLowerCase()) { repetido = true; } }
  if (nombre == "") { mostrarMensaje("mensajeIntegrante", "Escribe un nombre.", true); }
  else if (repetido == true) { mostrarMensaje("mensajeIntegrante", "Esa persona ya existe.", true); }
  else { integrantes.push(nombre); document.getElementById("nombreIntegrante").value = ""; mostrarMensaje("mensajeIntegrante", "Integrante agregado.", false); actualizarIntegrantes(); }
});

formularioGasto.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const concepto = document.getElementById("concepto").value;
  const valorIngresado = document.getElementById("valor").value;
  const formatoValido = /^\d+(\.\d{1,2})?$/.test(valorIngresado);
  const valor = Math.round(Number(valorIngresado) * 100);
  const fecha = document.getElementById("fecha").value;
  const pagador = document.getElementById("pagador").value;
  const participantes = obtenerParticipantes();
  if (concepto == "" || formatoValido == false || valor <= 0 || fecha == "" || pagador == "" || participantes.length == 0) { mostrarMensaje("mensajeGasto", "Completa todos los datos y usa maximo dos decimales.", true); }
  else {
    const gasto = { concepto: concepto, valor: valor, fecha: fecha, pagador: pagador, participantes: participantes };
    if (gastoEditado == -1) { gastos.push(gasto); }
    else { gastos[gastoEditado] = gasto; }
    actualizarGastos();
    limpiarFormularioGasto();
    mostrarMensaje("mensajeGasto", "Gasto guardado.", false);
  }
});

// Botones de navegacion y acciones finales.
document.getElementById("botonIntegrantes").onclick = function () { mostrarSeccion("integrantes"); };
document.getElementById("botonGastos").onclick = function () { if (integrantes.length < 2) { alert("Agrega al menos dos integrantes."); } else { mostrarSeccion("gastos"); } };
document.getElementById("botonResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("continuarGastos").onclick = document.getElementById("botonGastos").onclick;
document.getElementById("generarResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("cancelarEdicion").onclick = function () { limpiarFormularioGasto(); };
document.getElementById("exportarExcel").onclick = exportarExcel;
document.getElementById("compartirWhatsApp").onclick = compartirWhatsApp;
document.getElementById("cargarExcel").onchange = cargarExcel;
document.getElementById("reiniciar").onclick = function () { if (confirm("¿Deseas empezar de nuevo?") == true) { location.reload(); } };
