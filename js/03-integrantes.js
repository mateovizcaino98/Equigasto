// Gestion de integrantes y opciones de participantes.
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
