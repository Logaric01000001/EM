document.addEventListener('DOMContentLoaded', () => {
  const selectPaciente = document.getElementById('select-paciente');
  const formEmergencia = document.getElementById('form-emergencia');
  const inputHospital = document.getElementById('input-hospital');
  const inputDiagnostico = document.getElementById('input-diagnostico');
  const inputWebhookSite = document.getElementById('input-webhooksite');

  const webhookStatus = document.getElementById('webhook-site-status');
  const contentHospital = document.getElementById('content-hospital');
  const contentSeguro = document.getElementById('content-seguro');

  // Cargar lista de pacientes
  fetch('/api/pacientes')
    .then(res => res.json())
    .then(pacientes => {
      selectPaciente.innerHTML = '<option value="">-- Seleccionar Paciente --</option>';
      pacientes.forEach(p => {
        const infoPre = p.poliza && p.poliza.preexistencias.length > 0
          ? ` (${p.poliza.preexistencias.join(', ')})`
          : ' (Sin preexistencias)';
        
        selectPaciente.innerHTML += `<option value="${p.id}">${p.nombre} - Póliza: ${p.polizaId}${infoPre}</option>`;
      });
    })
    .catch(err => {
      console.error('Error al cargar pacientes:', err);
    });

  // Procesar envio del formulario
  formEmergencia.addEventListener('submit', (e) => {
    e.preventDefault();

    const pacienteId = selectPaciente.value;
    const hospital = inputHospital.value.trim();
    const diagnostico = inputDiagnostico.value.trim();
    const webhookSiteUrl = inputWebhookSite.value.trim();

    if (!pacienteId || !diagnostico) return;

    fetch('/api/webhook/emergencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteId,
        hospital,
        diagnostico,
        webhookSiteUrl
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.exito) {
        // Mostrar aviso si se envio a webhook.site
        if (data.enviadoAWebhookSite) {
          webhookStatus.classList.remove('hidden');
        } else {
          webhookStatus.classList.add('hidden');
        }

        renderizarNotificaciones(data.notificacionHospital, data.notificacionSeguro);
      }
    })
    .catch(err => {
      console.error('Error al procesar el ingreso:', err);
    });
  });

  function renderizarNotificaciones(hosp, seg) {
    let badgeClass = hosp.estado === 'APROBADO'
      ? 'status-badge aprobado'
      : hosp.estado === 'ALERTA_PREEXISTENCIA'
      ? 'status-badge alerta'
      : 'status-badge rechazado';

    contentHospital.innerHTML = `
      <span class="${badgeClass}">${hosp.estado}</span>
      <p><strong>Paciente:</strong> ${hosp.paciente} (Cédula: ${hosp.cedula})</p>
      <p><strong>Póliza:</strong> ${hosp.poliza} - ${hosp.plan}</p>
      <p><strong>Copago:</strong> ${hosp.copago}</p>
      <div class="instruccion-box">
        <strong>Instrucción:</strong> ${hosp.instruccion}
      </div>
    `;

    contentSeguro.innerHTML = `
      <span class="${badgeClass}">${seg.estado}</span>
      <p><strong>Paciente:</strong> ${seg.paciente} (Póliza: ${seg.poliza})</p>
      <p><strong>Diagnóstico:</strong> ${seg.diagnostico}</p>
      <p><strong>Preexistencia Hallada:</strong> ${seg.preexistenciaDetectada}</p>
      <div class="instruccion-box">
        <strong>Acción Recomendada:</strong> ${seg.accionRecomendada}
      </div>
    `;
  }
});
