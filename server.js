const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Leer archivos JSON de la carpeta data
function cargarDatos(nombreArchivo) {
  try {
    const raw = fs.readFileSync('./data/' + nombreArchivo, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Endpoint 1: Retorna lista de pacientes con sus polizas
app.get('/api/pacientes', (req, res) => {
  const pacientes = cargarDatos('pacientes.json');
  const polizas = cargarDatos('polizas.json');

  const lista = pacientes.map(p => {
    const poliza = polizas.find(pol => pol.numeroPoliza === p.polizaId);
    return { ...p, poliza };
  });

  res.json(lista);
});

// Endpoint 2: WEBHOOK RECEPTOR DE EMERGENCIAS
app.post('/api/webhook/emergencia', async (req, res) => {
  const { pacienteId, diagnostico, hospital, webhookSiteUrl } = req.body;

  if (!pacienteId || !diagnostico) {
    return res.status(400).json({ error: 'Faltan datos obligatorios del ingreso.' });
  }

  const pacientes = cargarDatos('pacientes.json');
  const polizas = cargarDatos('polizas.json');

  // Buscar paciente y poliza
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) {
    return res.status(404).json({ error: 'Paciente no encontrado.' });
  }

  const poliza = polizas.find(p => p.numeroPoliza === paciente.polizaId);

  // Analizar estado de cobertura y preexistencias
  let estado = 'APROBADO';
  let mensaje = 'Póliza vigente. Cobertura autorizada directamente.';
  let preexistenciaEncontrada = 'Ninguna';

  if (!poliza || poliza.estado !== 'Vigente') {
    estado = 'RECHAZADO';
    mensaje = 'Póliza inactiva o suspendida. Sin cobertura.';
  } else {
    const diagMin = diagnostico.toLowerCase();
    for (let item of poliza.preexistencias) {
      if (diagMin.includes(item.toLowerCase())) {
        estado = 'ALERTA_PREEXISTENCIA';
        preexistenciaEncontrada = item;
        mensaje = 'Diagnóstico coincide con preexistencia registrada: ' + item;
        break;
      }
    }
  }

  // Estructura de notificaciones
  const notificacionHospital = {
    tipoNotificacion: 'Admision Hospitalaria',
    hospital: hospital || 'Hospital Metropolitano',
    paciente: paciente.nombre,
    cedula: paciente.cedula,
    poliza: paciente.polizaId,
    plan: poliza ? poliza.plan : 'Sin Plan',
    estado: estado,
    copago: poliza ? poliza.copago + '%' : '0%',
    instruccion: estado === 'APROBADO' 
      ? 'Ingreso autorizado. Cobertura activa.'
      : estado === 'ALERTA_PREEXISTENCIA'
      ? 'Ingresar paciente. Expediente en revisión por preexistencia.'
      : 'Atención prioritaria. Requerir garantía de pago.'
  };

  const notificacionSeguro = {
    tipoNotificacion: 'Gestor de Casos Aseguradora',
    paciente: paciente.nombre,
    poliza: paciente.polizaId,
    diagnostico: diagnostico,
    preexistenciaDetectada: preexistenciaEncontrada,
    estado: estado,
    accionRecomendada: estado === 'ALERTA_PREEXISTENCIA'
      ? 'Auditar historial clínico previo del paciente.'
      : estado === 'APROBADO'
      ? 'Registrar siniestro pre-autorizado.'
      : 'Suspender carta de garantía.'
  };

  // Reenviar a webhook.site si se proporciono la URL
  let enviadoAWebhookSite = false;
  if (webhookSiteUrl && webhookSiteUrl.startsWith('http')) {
    try {
      await fetch(webhookSiteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'ALERTA_EMERGENCIA_HOSPITALARIA',
          fechaHora: new Date().toISOString(),
          hospital: notificacionHospital.hospital,
          paciente: paciente.nombre,
          cedula: paciente.cedula,
          poliza: paciente.polizaId,
          diagnostico: diagnostico,
          estadoCobertura: estado,
          notificacionHospital: notificacionHospital,
          notificacionSeguro: notificacionSeguro
        })
      });
      enviadoAWebhookSite = true;
    } catch (err) {
      console.error('Error al notificar a webhook.site:', err.message);
    }
  }

  res.json({
    exito: true,
    estado,
    mensaje,
    enviadoAWebhookSite,
    notificacionHospital,
    notificacionSeguro
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
