// Registro, edicion y eliminacion de gastos.
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
