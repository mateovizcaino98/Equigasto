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

// GENERACIÓN DEL RESUMEN: construye el detalle de todos los gastos registrados.
function actualizarGastosResumen() {
  let filas = "";
  let i;
  for (i = 0; i < gastos.length; i++) {
    filas += '<tr><td data-label="Gasto"><strong>' + gastos[i].concepto + '</strong></td><td data-label="Fecha">' + gastos[i].fecha + '</td><td data-label="Valor"><strong>' + dinero(gastos[i].valor) + '</strong></td><td data-label="Pagó">' + gastos[i].pagador + '</td><td data-label="Participaron">' + gastos[i].participantes.join(", ") + '</td></tr>';
  }
  if (filas == "") { filas = '<tr><td class="sinGastosResumen" colspan="5">Todavía no hay gastos para resumir.</td></tr>'; }
  document.getElementById("gastosResumen").innerHTML = filas;
  document.getElementById("numeroGastosResumen").innerHTML = gastos.length + " gastos";
}

// CÁLCULO Y DISTRIBUCIÓN DE GASTOS: total, valores pagados, partes y centavos sobrantes.
function calcularResumen() {
  const balances = [];
  let total = 0;
  let tarjetas = "";
  let i;
  let j;
  // Prepara en cero los valores financieros de cada integrante.
  for (i = 0; i < integrantes.length; i++) { balances.push({ nombre: integrantes[i], pagado: 0, corresponde: 0, balance: 0 }); }
  // Divide cada gasto equitativamente en centavos completos y acredita el total al pagador.
  for (i = 0; i < gastos.length; i++) {
    total += gastos[i].valor;
    const numeroParticipantes = gastos[i].participantes.length;
    const parte = Math.floor(gastos[i].valor / numeroParticipantes);
    const sobrante = gastos[i].valor % numeroParticipantes;
    // Alterna entre gastos quién recibe los centavos que no pueden dividirse exactamente.
    const inicioReparto = i % numeroParticipantes;
    for (j = 0; j < balances.length; j++) {
      if (balances[j].nombre == gastos[i].pagador) { balances[j].pagado += gastos[i].valor; }
      const posicion = gastos[i].participantes.indexOf(balances[j].nombre);
      if (posicion != -1) {
        const distancia = (posicion - inicioReparto + numeroParticipantes) % numeroParticipantes;
        balances[j].corresponde += parte + (distancia < sobrante ? 1 : 0);
      }
    }
  }
  // CÁLCULO DE BALANCES: determina si cada integrante recibe, paga o queda a paz y salvo.
  for (i = 0; i < balances.length; i++) {
    balances[i].balance = balances[i].pagado - balances[i].corresponde;
    let estado = "Está a paz y salvo";
    let clase = "neutro";
    if (balances[i].balance > 0) { estado = "Debe recibir " + dinero(balances[i].balance); clase = "positivo"; }
    if (balances[i].balance < 0) { estado = "Debe pagar " + dinero(-balances[i].balance); clase = "negativo"; }
    tarjetas += '<div class="balance"><span class="avatar">' + balances[i].nombre.charAt(0).toUpperCase() + '</span><h3>' + balances[i].nombre + '</h3><div><span>Pagó</span><strong>' + dinero(balances[i].pagado) + '</strong></div><div><span>Le corresponde</span><strong>' + dinero(balances[i].corresponde) + '</strong></div><p class="estado ' + clase + '">' + estado + '</p></div>';
  }
  document.getElementById("totalGastado").innerHTML = dinero(total);
  actualizarGastosResumen();
  document.getElementById("balances").innerHTML = tarjetas;
  calcularPagos(balances);
}

// CÁLCULO DE BALANCES Y PAGOS PARA SALDAR: cruza deudores y acreedores hasta equilibrarlos.
function calcularPagos(balances) {
  const deudores = [];
  const acreedores = [];
  let contenido = "";
  let i;
  for (i = 0; i < balances.length; i++) {
    if (balances[i].balance < 0) { deudores.push({ nombre: balances[i].nombre, valor: -balances[i].balance }); }
    if (balances[i].balance > 0) { acreedores.push({ nombre: balances[i].nombre, valor: balances[i].balance }); }
  }
  let deudor = 0;
  let acreedor = 0;
  while (deudor < deudores.length && acreedor < acreedores.length) {
    let pago = deudores[deudor].valor;
    if (acreedores[acreedor].valor < pago) { pago = acreedores[acreedor].valor; }
    contenido += '<div class="pago"><span><strong>' + deudores[deudor].nombre + '</strong> le paga a <strong>' + acreedores[acreedor].nombre + '</strong></span><strong>' + dinero(pago) + '</strong></div>';
    deudores[deudor].valor -= pago;
    acreedores[acreedor].valor -= pago;
    if (deudores[deudor].valor == 0) { deudor++; }
    if (acreedores[acreedor].valor == 0) { acreedor++; }
  }
  if (gastos.length == 0) { contenido = '<div class="vacio">Registra gastos para calcular los pagos.</div>'; }
  else if (contenido == "") { contenido = '<p class="positivo">Las cuentas ya están equilibradas.</p>'; }
  document.getElementById("listaPagos").innerHTML = contenido;
}

// VALIDACIONES Y EVENTOS DE LOS FORMULARIOS: creación del grupo.
formularioGrupo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const nombre = document.getElementById("nombreGrupo").value;
  if (nombre == "") { mostrarMensaje("mensajeGrupo", "Escribe un nombre para continuar.", true); }
  else { document.getElementById("tituloGrupo").innerHTML = nombre; document.getElementById("inicioAplicacion").classList.add("oculto"); document.getElementById("contenidoAplicacion").classList.remove("oculto"); }
});

// VALIDACIONES Y EVENTOS DE LOS FORMULARIOS: registro de integrantes.
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

// VALIDACIONES Y EVENTOS DE LOS FORMULARIOS: creación o actualización de gastos válidos.
formularioGasto.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const concepto = document.getElementById("concepto").value;
  const valorIngresado = document.getElementById("valor").value;
  const formatoValido = /^\d+(\.\d{1,2})?$/.test(valorIngresado);
  const valor = Math.round(Number(valorIngresado) * 100);
  const fecha = document.getElementById("fecha").value;
  const pagador = document.getElementById("pagador").value;
  const participantes = obtenerParticipantes();
  if (concepto == "" || formatoValido == false || valor <= 0 || fecha == "" || pagador == "" || participantes.length == 0) { mostrarMensaje("mensajeGasto", "Completa todos los datos y usa máximo dos decimales.", true); }
  else {
    const gasto = { concepto: concepto, valor: valor, fecha: fecha, pagador: pagador, participantes: participantes };
    if (gastoEditado == -1) { gastos.push(gasto); }
    else { gastos[gastoEditado] = gasto; }
    actualizarGastos();
    limpiarFormularioGasto();
    mostrarMensaje("mensajeGasto", "Gasto guardado.", false);
  }
});

// NAVEGACIÓN Y REINICIO: conecta pestañas, exige dos integrantes y confirma un nuevo inicio.
document.getElementById("botonIntegrantes").onclick = function () { mostrarSeccion("integrantes"); };
document.getElementById("botonGastos").onclick = function () { if (integrantes.length < 2) { alert("Agrega al menos dos integrantes."); } else { mostrarSeccion("gastos"); } };
document.getElementById("botonResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("continuarGastos").onclick = document.getElementById("botonGastos").onclick;
document.getElementById("generarResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("cancelarEdicion").onclick = function () { limpiarFormularioGasto(); };
document.getElementById("reiniciar").onclick = function () { if (confirm("¿Deseas empezar de nuevo?") == true) { location.reload(); } };
