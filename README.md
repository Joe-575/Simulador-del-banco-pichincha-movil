# Banco Pichincha Móvil - Simulación Web

Este proyecto es una simulación visual y funcional en formato web de la aplicación **Banco Pichincha | Móvil**. Está construido utilizando tecnologías estándar de la web (HTML, CSS y JavaScript Vanilla) para ofrecer una experiencia móvil directamente desde el navegador, sin necesidad de instalación.

## 🚀 Características y Funcionalidades

- **Pantalla de Inicio de Sesión:** Simulación de validación de credenciales (Usuario: *alexis*, Contraseña: *1234*).
- **Dashboard Principal:** Vista general con el saldo disponible total y tarjetas de acceso rápido.
- **Gestión de Cuentas:** Visualización de saldo diferenciado entre cuentas ("Ahorros Flexible" y "Pibank Digital"), y visualización de movimientos recientes.
- **Simulación de Transacciones (Flujo interactivo):**
  - **Transferencias:** Búsqueda de contactos, agregar nuevos contactos y simulación de envío de dinero.
  - **Pagos de Servicios:** Opciones para pagar Luz, Agua, Teléfono e Internet.
  - **Recargas:** Selección de operadoras (Claro, Movistar, CNT, Tuenti) con ingreso de número celular.
  - **Deuna! (Pagos QR):** Simulación de pantalla de escaneo de códigos QR.
- **Gestión de Tarjetas:** Pantalla interactiva con efecto 3D (Flip) para visualizar las tarjetas de débito y crédito físicas, tanto en su anverso como reverso.
- **Transferir Regalo:** Módulo lúdico para enviar regalos monetarios virtuales según la ocasión (Navidad, Cumpleaños, etc.) con selección de postales.
- **Diseño Responsivo:** Adaptado completamente para emular la interfaz de un dispositivo móvil moderno.

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica de la aplicación y sus múltiples "pantallas" (`div.screen`).
- **CSS3:** Estilización moderna empleando Flexbox, Grid, variables nativas, transiciones y animaciones personalizadas (ej. efecto flip de tarjetas 3D).
- **JavaScript (Vanilla):** Lógica del lado del cliente para manejar la navegación entre pantallas (SPA simulada), interacción con modales, simulación de carga y flujos de transacciones.
- **[Font Awesome](https://fontawesome.com/):** Biblioteca externa utilizada para toda la iconografía de la aplicación.

## 📋 Requisitos e Instalación

Debido a que es un proyecto de Frontend estático, **no necesitas instalar Node.js ni ningún gestor de paquetes**.

1. Descarga o clona el repositorio/carpeta del proyecto.
2. Abre la carpeta `Pagina_web-App_BancaMovil` en tu computadora.
3. Haz doble clic en el archivo `index.html`.
4. El proyecto se abrirá en tu navegador web predeterminado. Para una mejor experiencia, te recomendamos abrir las **Herramientas de Desarrollador** de tu navegador (F12) y activar la **Vista de Dispositivo Móvil**.

## 📁 Estructura de Archivos

```text
Pagina_web-App_BancaMovil/
├── index.html     # Estructura principal, modales y templates de pantallas
├── style.css      # Reglas de estilo, animaciones y diseño responsivo
├── main.js        # Lógica de navegación, validaciones y simulaciones
└── README.md      # Este archivo de documentación
```

## 🔒 Credenciales de Prueba

Para ingresar al simulador, utiliza los siguientes datos de demostración al abrir la aplicación:
- **Usuario:** `alexis`
- **Contraseña:** `1234`
