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
  return "$" + (centavos / 100).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularDatosResumen() {
  const balances = [];
  const pagos = [];
  let total = 0;
  let i;
  let j;

  for (i = 0; i < integrantes.length; i++) { balances.push({ nombre: integrantes[i], pagado: 0, corresponde: 0, balance: 0 }); }
  for (i = 0; i < gastos.length; i++) {
    total += gastos[i].valor;
    const numeroParticipantes = gastos[i].participantes.length;
    const parte = Math.floor(gastos[i].valor / numeroParticipantes);
    const sobrante = gastos[i].valor % numeroParticipantes;
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
  for (i = 0; i < balances.length; i++) { balances[i].balance = balances[i].pagado - balances[i].corresponde; }

  const deudores = balances.filter(function (balance) { return balance.balance < 0; }).map(function (balance) { return { nombre: balance.nombre, valor: -balance.balance }; });
  const acreedores = balances.filter(function (balance) { return balance.balance > 0; }).map(function (balance) { return { nombre: balance.nombre, valor: balance.balance }; });
  let deudor = 0;
  let acreedor = 0;
  while (deudor < deudores.length && acreedor < acreedores.length) {
    const valorPago = Math.min(deudores[deudor].valor, acreedores[acreedor].valor);
    pagos.push({ deudor: deudores[deudor].nombre, acreedor: acreedores[acreedor].nombre, valor: valorPago });
    deudores[deudor].valor -= valorPago;
    acreedores[acreedor].valor -= valorPago;
    if (deudores[deudor].valor == 0) { deudor++; }
    if (acreedores[acreedor].valor == 0) { acreedor++; }
  }
  return { total: total, balances: balances, pagos: pagos };
}

function exportarExcel() {
  if (typeof XLSX == "undefined") { alert("No se pudo cargar el exportador de Excel. Revisa tu conexión a internet."); return; }
  if (gastos.length == 0) { alert("Registra al menos un gasto antes de exportar."); return; }
  const datos = calcularDatosResumen();
  const nombreGrupo = document.getElementById("tituloGrupo").innerHTML || "EquiGasto";
  const hojaGastos = gastos.map(function (gasto) {
    return { Gasto: gasto.concepto, Fecha: gasto.fecha, Valor: gasto.valor / 100, Pagó: gasto.pagador, Participantes: gasto.participantes.join(", ") };
  });
  const hojaBalances = datos.balances.map(function (balance) {
    return { Integrante: balance.nombre, Pagado: balance.pagado / 100, "Le corresponde": balance.corresponde / 100, Balance: balance.balance / 100 };
  });
  const hojaPagos = datos.pagos.map(function (pago) {
    return { Deudor: pago.deudor, Acreedor: pago.acreedor, Valor: pago.valor / 100 };
  });
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaGastos), "Gastos");
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaBalances), "Balances");
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaPagos), "Pagos");
  XLSX.writeFile(libro, "EquiGasto_" + nombreGrupo.replace(/[^a-z0-9]/gi, "_") + ".xlsx");
}

function cargarExcel(evento) {
  if (typeof XLSX == "undefined") { mostrarMensaje("mensajeCargaExcel", "No se pudo cargar el lector de Excel.", true); return; }
  const archivo = evento.target.files[0];
  if (!archivo) { return; }
  const lector = new FileReader();
  lector.onload = function (resultado) {
    try {
      const libro = XLSX.read(new Uint8Array(resultado.target.result), { type: "array" });
      const nombreHoja = libro.SheetNames.indexOf("Gastos") != -1 ? "Gastos" : libro.SheetNames[0];
      const filas = XLSX.utils.sheet_to_json(libro.Sheets[nombreHoja], { defval: "" });
      const gastosCargados = [];
      const integrantesCargados = [];
      let i;
      for (i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const concepto = String(fila.Gasto || "").trim();
        const pagador = String(fila["Pagó"] || "").trim();
        const participantes = String(fila.Participantes || "").split(",").map(function (nombre) { return nombre.trim(); }).filter(function (nombre) { return nombre != ""; });
        let valor = fila.Valor;
        if (typeof valor == "string") {
          valor = valor.indexOf(",") != -1 ? valor.replace(/\$/g, "").replace(/\./g, "").replace(",", ".") : valor.replace(/\$/g, "");
        }
        valor = Math.round(Number(valor) * 100);
        if (concepto == "" || !Number.isFinite(valor) || valor <= 0 || pagador == "" || participantes.length == 0) { continue; }
        gastosCargados.push({ concepto: concepto, valor: valor, fecha: String(fila.Fecha || ""), pagador: pagador, participantes: participantes });
        integrantesCargados.push(pagador);
        participantes.forEach(function (nombre) { integrantesCargados.push(nombre); });
      }
      if (gastosCargados.length == 0) { mostrarMensaje("mensajeCargaExcel", "El Excel no contiene gastos válidos en la hoja Gastos.", true); return; }
      integrantes = integrantesCargados.filter(function (nombre, indice) { return integrantesCargados.indexOf(nombre) == indice; });
      gastos = gastosCargados;
      actualizarIntegrantes();
      actualizarGastos();
      mostrarMensaje("mensajeCargaExcel", gastos.length + " gastos cargados correctamente.", false);
    } catch (error) {
      mostrarMensaje("mensajeCargaExcel", "No se pudo leer el archivo seleccionado.", true);
    }
  };
  lector.readAsArrayBuffer(archivo);
}

function compartirWhatsApp() {
  if (gastos.length == 0) { alert("Registra al menos un gasto antes de compartir."); return; }
  const datos = calcularDatosResumen();
  const nombreGrupo = document.getElementById("tituloGrupo").innerHTML || "mi grupo";
  let mensaje = "*EquiGasto - " + nombreGrupo + "*\n\nTotal gastado: " + dinero(datos.total) + "\n\n*Pagos para saldar:*\n";
  if (datos.pagos.length == 0) { mensaje += "Las cuentas ya están equilibradas."; }
  else {
    datos.pagos.forEach(function (pago) { mensaje += "- " + pago.deudor + " le paga a " + pago.acreedor + ": " + dinero(pago.valor) + "\n"; });
  }
  const telefono = prompt("Número de WhatsApp con código de país, sin + (opcional):", "");
  if (telefono === null) { return; }
  const numero = telefono.replace(/\D/g, "");
  if (telefono.trim() != "" && numero.length < 7) { alert("Escribe un número válido con código de país."); return; }
  const url = numero == "" ? "https://wa.me/?text=" : "https://wa.me/" + numero + "?text=";
  window.open(url + encodeURIComponent(mensaje), "_blank");
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
document.getElementById("exportarExcel").onclick = exportarExcel;
document.getElementById("compartirWhatsApp").onclick = compartirWhatsApp;
document.getElementById("cargarExcel").onchange = cargarExcel;
document.getElementById("reiniciar").onclick = function () { if (confirm("¿Deseas empezar de nuevo?") == true) { location.reload(); } };
