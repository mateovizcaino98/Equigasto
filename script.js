// DATOS PRINCIPALES DE LA APLICACIÓN: integrantes, gastos y estado de edición.
let integrantes = [];
let gastos = [];
let gastoEditado = -1;

// FUNCIONES AUXILIARES: referencias de formularios, mensajes, navegación y formato monetario.
const formularioGrupo = document.getElementById("formularioGrupo");
const formularioIntegrante = document.getElementById("formularioIntegrante");
const formularioGasto = document.getElementById("formularioGasto");

function mostrarMensaje(id, texto, error) {
  const elemento = document.getElementById(id);
  elemento.innerHTML = texto;
  if (error == true) { elemento.style.color = "#b04a4a"; }
  else { elemento.style.color = "#3f9b7e"; }
}

function mostrarSeccion(id) {
  document.getElementById("integrantes").classList.add("oculto");
  document.getElementById("gastos").classList.add("oculto");
  document.getElementById("resumen").classList.add("oculto");
  document.getElementById("botonIntegrantes").classList.remove("activa");
  document.getElementById("botonGastos").classList.remove("activa");
  document.getElementById("botonResumen").classList.remove("activa");
  document.getElementById(id).classList.remove("oculto");
  if (id == "integrantes") { document.getElementById("botonIntegrantes").classList.add("activa"); }
  if (id == "gastos") { document.getElementById("botonGastos").classList.add("activa"); }
  if (id == "resumen") { document.getElementById("botonResumen").classList.add("activa"); calcularResumen(); }
}

function dinero(centavos) {
  return "$" + (centavos / 100).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}