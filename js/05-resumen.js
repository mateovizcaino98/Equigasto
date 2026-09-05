// Calculo y visualizacion del resumen.
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

function calcularResumen() {
  const balances = [];
  let total = 0;
  let tarjetas = "";
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
  for (i = 0; i < balances.length; i++) {
    balances[i].balance = balances[i].pagado - balances[i].corresponde;
    let estado = "Esta a paz y salvo";
    let clase = "neutro";
    if (balances[i].balance > 0) { estado = "Debe recibir " + dinero(balances[i].balance); clase = "positivo"; }
    if (balances[i].balance < 0) { estado = "Debe pagar " + dinero(-balances[i].balance); clase = "negativo"; }
    tarjetas += '<div class="balance"><span class="avatar">' + balances[i].nombre.charAt(0).toUpperCase() + '</span><h3>' + balances[i].nombre + '</h3><div><span>Pago</span><strong>' + dinero(balances[i].pagado) + '</strong></div><div><span>Le corresponde</span><strong>' + dinero(balances[i].corresponde) + '</strong></div><p class="estado ' + clase + '">' + estado + '</p></div>';
  }
  document.getElementById("totalGastado").innerHTML = dinero(total);
  actualizarGastosResumen();
  document.getElementById("balances").innerHTML = tarjetas;
  calcularPagos(balances);
}

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
  else if (contenido == "") { contenido = '<p class="positivo">Las cuentas ya estan equilibradas.</p>'; }
  document.getElementById("listaPagos").innerHTML = contenido;
}
