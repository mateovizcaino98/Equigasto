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

// GESTIÓN DE INTEGRANTES: listado, cantidad, opciones de gasto y eliminación controlada.
function actualizarIntegrantes() {
  let contenido = "";
  let i;
  for (i = 0; i < integrantes.length; i++) {
    contenido += '<div class="persona"><span class="avatar">' + integrantes[i].charAt(0).toUpperCase() + '</span><strong>' + integrantes[i] + '</strong><button type="button" onclick="eliminarIntegrante(' + i + ')">Eliminar</button></div>';
  }
  if (contenido == "") { contenido = '<div class="vacio">Todavía no hay integrantes.</div>'; }
  document.getElementById("listaIntegrantes").innerHTML = contenido;
  document.getElementById("numeroIntegrantes").innerHTML = integrantes.length + " personas";
  actualizarOpciones();
}

function eliminarIntegrante(indice) {
  let i;
  for (i = 0; i < gastos.length; i++) {
    if (gastos[i].pagador == integrantes[indice] || gastos[i].participantes.indexOf(integrantes[indice]) != -1) {
      alert("Esta persona aparece en un gasto y no se puede eliminar.");
      return;
    }
  }
  integrantes.splice(indice, 1);
  actualizarIntegrantes();
}

function actualizarOpciones() {
  let opciones = '<option value="">Selecciona una persona</option>';
  let casillas = "";
  let i;
  for (i = 0; i < integrantes.length; i++) {
    opciones += '<option value="' + integrantes[i] + '">' + integrantes[i] + '</option>';
    casillas += '<label class="opcion"><input type="checkbox" name="participante" value="' + integrantes[i] + '">' + integrantes[i] + '</label>';
  }
  document.getElementById("pagador").innerHTML = opciones;
  document.getElementById("opcionesParticipantes").innerHTML = casillas;
}

// REGISTRO Y ADMINISTRACIÓN DE GASTOS: selección, historial, edición, cancelación y eliminación.
function obtenerParticipantes() {
  const casillas = document.getElementsByName("participante");
  const seleccionados = [];
  let i;
  for (i = 0; i < casillas.length; i++) {
    if (casillas[i].checked == true) { seleccionados.push(casillas[i].value); }
  }
  return seleccionados;
}

function limpiarFormularioGasto() {
  formularioGasto.reset();
  gastoEditado = -1;
  document.getElementById("tituloFormularioGasto").innerHTML = "Registra un gasto";
  document.getElementById("guardarGasto").innerHTML = "Agregar gasto";
  document.getElementById("cancelarEdicion").classList.add("oculto");
}

function actualizarGastos() {
  let contenido = "";
  let i;
  for (i = 0; i < gastos.length; i++) {
    contenido += '<div class="gasto"><div><strong>' + gastos[i].concepto + '</strong><p>Pagó ' + gastos[i].pagador + ' · ' + gastos[i].fecha + ' · ' + gastos[i].participantes.length + ' participantes</p></div><strong>' + dinero(gastos[i].valor) + '</strong><div class="acciones"><button type="button" onclick="editarGasto(' + i + ')">Editar</button><button type="button" onclick="eliminarGasto(' + i + ')">Eliminar</button></div></div>';
  }
  if (contenido == "") { contenido = '<div class="vacio">Todavía no hay gastos.</div>'; }
  document.getElementById("listaGastos").innerHTML = contenido;
  document.getElementById("numeroGastos").innerHTML = gastos.length + " gastos";
}

function editarGasto(indice) {
  const gasto = gastos[indice];
  const casillas = document.getElementsByName("participante");
  let i;
  gastoEditado = indice;
  document.getElementById("concepto").value = gasto.concepto;
  document.getElementById("valor").value = (gasto.valor / 100).toFixed(2);
  document.getElementById("fecha").value = gasto.fecha;
  document.getElementById("pagador").value = gasto.pagador;
  for (i = 0; i < casillas.length; i++) { casillas[i].checked = gasto.participantes.indexOf(casillas[i].value) != -1; }
  document.getElementById("tituloFormularioGasto").innerHTML = "Edita el gasto";
  document.getElementById("guardarGasto").innerHTML = "Guardar cambios";
  document.getElementById("cancelarEdicion").classList.remove("oculto");
}

function eliminarGasto(indice) {
  if (confirm("¿Deseas eliminar este gasto?") == true) {
    gastos.splice(indice, 1);
    actualizarGastos();
    limpiarFormularioGasto();
  }
}
