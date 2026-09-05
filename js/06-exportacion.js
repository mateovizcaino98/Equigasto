// Importacion, exportacion y compartir resultados.
function exportarExcel() {
  if (typeof XLSX == "undefined") { alert("No se pudo cargar el exportador de Excel. Revisa tu conexion a internet."); return; }
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
        const pagador = String(fila["Pagó"] || fila.Pago || "").trim();
        const participantes = String(fila.Participantes || "").split(",").map(function (nombre) { return nombre.trim(); }).filter(function (nombre) { return nombre != ""; });
        let valor = fila.Valor;
        if (typeof valor == "string") { valor = valor.indexOf(",") != -1 ? valor.replace(/\$/g, "").replace(/\./g, "").replace(",", ".") : valor.replace(/\$/g, ""); }
        valor = Math.round(Number(valor) * 100);
        if (concepto == "" || !Number.isFinite(valor) || valor <= 0 || pagador == "" || participantes.length == 0) { continue; }
        gastosCargados.push({ concepto: concepto, valor: valor, fecha: String(fila.Fecha || ""), pagador: pagador, participantes: participantes });
        integrantesCargados.push(pagador);
        participantes.forEach(function (nombre) { integrantesCargados.push(nombre); });
      }
      if (gastosCargados.length == 0) { mostrarMensaje("mensajeCargaExcel", "El Excel no contiene gastos validos en la hoja Gastos.", true); return; }
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
  if (datos.pagos.length == 0) { mensaje += "Las cuentas ya estan equilibradas."; }
  else { datos.pagos.forEach(function (pago) { mensaje += "- " + pago.deudor + " le paga a " + pago.acreedor + ": " + dinero(pago.valor) + "\n"; }); }
  const telefono = prompt("Numero de WhatsApp con codigo de pais, sin + (opcional):", "");
  if (telefono === null) { return; }
  const numero = telefono.replace(/\D/g, "");
  if (telefono.trim() != "" && numero.length < 7) { alert("Escribe un numero valido con codigo de pais."); return; }
  const url = numero == "" ? "https://wa.me/?text=" : "https://wa.me/" + numero + "?text=";
  window.open(url + encodeURIComponent(mensaje), "_blank");
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
