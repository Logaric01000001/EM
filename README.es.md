# Sistema de Control de Emergencias Hospitalarias - Reto 4

Proyecto para el **Reto 4** del HackIAthon: Sistema de Alerta Temprana de Ingresos a Emergencias.

## Descripción del Sistema

Este sistema permite auditar en tiempo real la llegada de un paciente a la sala de urgencias de un hospital:

1. **Recepción Webhook (`/api/webhook/emergencia`)**: Recibe los datos del paciente, diagnóstico e institución médica.
2. **Auditoría de Póliza y Preexistencias**: Verifica si la póliza del paciente está vigente y si el diagnóstico coincide con el historial de enfermedades preexistentes.
3. **Notificación Simultánea**: Transmite el dictamen tanto a la **Admisión del Hospital** como al **Gestor de Casos de la Aseguradora**.
4. **Reenvío Externo a Webhook.site**: Si se ingresa una URL de webhook.site, la alerta completa se transmite en vivo a ese panel externo.

---

## Estructura del Proyecto

- `server.js`: Servidor Express con las rutas y la lógica de validación.
- `data/pacientes.json`: Pacientes asegurados de prueba.
- `data/polizas.json`: Pólizas, copagos y preexistencias.
- `public/`: Interfaz web interactiva (HTML, CSS y JavaScript).

---

## Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor:
   ```bash
   npm start
   ```

3. Abrir en el navegador:
   ```
   http://localhost:3000
   ```
