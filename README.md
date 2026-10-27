# ⚖️ SIGMA-T — Panel Administrativo

<div align="center">

![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-guinda?style=for-the-badge)

**SIGMA-T: Sistema Integrado de Gestión y Monitoreo de Acompañamiento Terapéutico**

*Diseñado y desarrollado por **Antonio Soto***

[Características](#-características-principales) •
[Módulos del Sistema](#-módulos-del-sistema) •
[Arquitectura y Tecnologías](#-arquitectura-y-tecnologías) •
[Instalación y Uso](#-instalación-y-despliegue) •
[Matriz de Permisos](#-seguridad-y-permisos-por-rol)

---

</div>

## 📌 Descripción del Proyecto

El **SIGMA-T (Sistema Integrado de Gestión y Monitoreo de Acompañamiento Terapéutico — Panel Administrativo)** es una solución web institucional de alta fidelidad diseñada para el monitoreo, fiscalización y seguimiento de comparecencias obligatorias de personas con mandatos judiciales en juzgados de familia (medidas de protección, asistencia a terapias, programas multidisciplinarios y cumplimiento de hitos procesales).

Ofrece una interfaz ágil, reactiva y elegante para personal judicial, administradores y especialistas, con soporte en tiempo real de semáforos de cumplimiento, auditoría de inasistencias y gestión descentralizada de permisos por rol.

---

## 🚀 Características Principales

- 📊 **Dashboard Ejecutivo en Tiempo Real:** Métricas clave, indicadores semafóricos de cumplimiento (En Curso, Cumple, En Riesgo, Incumplimiento, Culminado) y gráficos analíticos interactivos.
- 👥 **Padrón de Beneficiarios y Expedientes:** Ficha integral del denunciado/asistido, registro de juzgados de origen, expediente judicial y consentimiento informado con firma digital.
- 🎯 **Control de Hitos de Verificación:** Seguimiento periódico de comparecencias con metas de sesiones requeridas, alertas tempranas de vencimiento y comunicación oportuna ante incumplimientos.
- 📅 **Gestión de Asistencias y Auditoría:** Trazabilidad completa de sesiones registradas vía QR/móvil, marcas horarias y verificación de identidad.
- 📋 **Flujo de Justificaciones con Debido Proceso:** Bandeja de resolución con estados de ciclo de vida (`ENVIADA` ➔ `EN REVISIÓN` ➔ `APROBADA` / `OBSERVADA` / `RECHAZADA`), visualizador de comprobantes médicos/laborales y registro de auditoría.
- 🛡️ **Seguridad Granular (RBAC + Pantallas Dinámicas):** Asignación interactiva de vistas y módulos visibles mediante la matriz `rol_pantalla`, sincronizada reactivamente con el menú lateral en tiempo real.
- 📱 **Soporte PWA (Progressive Web App):** Instalable como aplicación nativa en Windows, macOS, Android e iOS, con Service Worker, caché de interfaz (App Shell), modo standalone y accesos directos.
- 📈 **Reportes y Exportación:** Generación de resúmenes consolidados para emisión de informes a juzgados y despachos fiscales.

---

## 🧩 Módulos del Sistema

| Módulo | Icono | Descripción |
| :--- | :---: | :--- |
| **Dashboard** | 📊 | Resumen global, indicadores de alerta judicial, semáforos de casos y accesos rápidos. |
| **Beneficiarios** | 👥 | Maestro de expedientes, registro de personas sujetas a control y estado de consentimiento. |
| **Hitos** | 🚩 | Configuración de metas de comparecencia, sesiones exigidas y monitoreo de plazos legales. |
| **Asistencias** | 📅 | Detalle de marcaciones presenciales, firmas y bitácora de cumplimiento por fecha. |
| **Justificaciones** | 📑 | Gestión de solicitudes de dispensa con revisión de adjuntos y dictamen fundado/infundado. |
| **Reportes** | 📈 | Análisis estadístico, tasas de inasistencia y exportación de datos consolidados. |
| **Personas** | 👤 | Padrón unificado de ciudadanos con DNI, datos de contacto y antecedentes en el sistema. |
| **Usuarios** | 🧑‍💼 | Cuentas institucionales, asignación de perfiles y estados de acceso. |
| **Roles** | 🛡️ | Catálogo de roles del sistema (Superadmin, Admin, Juez, Asistente, Beneficiario). |
| **Pantallas** | 🎛️ | Asignador dinámico de permisos por rol con interfaz de casillas de verificación en tiempo real. |

---

## 🎨 Semáforo de Estado de Casos Judiciales

El sistema implementa una escala visual de estados de expediente para soporte a las decisiones del personal judicial:

- 🔵 **En Curso:** Expediente vigente dentro del plazo ordinario de comparecencia.
- 🟢 **Cumple:** Registros continuos y conformes con el cronograma programado.
- 🟡 **Alerta / En Riesgo:** Casos próximos a expirar sin cuota suficiente o con justificaciones pendientes de revisión.
- 🔴 **Incumplimiento:** Hito vencido sin acreditación de asistencias ni justificación válida (apto para comunicación fiscal - art. 368 CP).
- 🟣 **Culminado / Apto para Cierre:** Meta de sesiones completada satisfactoriamente para emisión de informe final al Juez.

---

## 🛠️ Arquitectura y Tecnologías

### Frontend
- **Framework Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador y Servidor Dev:** [Vite](https://vitejs.dev/)
- **Estilos y Diseño UI:** [Tailwind CSS v4](https://tailwindcss.com/) + Paleta Institucional (Guinda, Olivo, Suave, Carbón)
- **Componentes Base:** [Base UI](https://base-ui.com/) + [Lucide React Icons](https://lucide.dev/)
- **Manejo de Estado y Caché:** [Redux Toolkit](https://redux-toolkit.js.org/) + **RTK Query** (con invalidación automática de tags de caché)
- **Enrutamiento:** [React Router v8](https://reactrouter.com/)
- **Visualización de Datos:** [Recharts](https://recharts.org/)

### Backend Conectado
- **API RESTful:** [Laravel 11 / 12](https://laravel.com/) con autenticación mediante **Laravel Sanctum**.
- **Base de Datos:** MySQL / PostgreSQL con auditoría de cambios y transacciones relacionales.

---

## 📂 Estructura del Proyecto

```plaintext
control-asistencia-admin/
├── public/                 # Recursos públicos e isotipos
├── src/
│   ├── app/                # Configuración de Redux Store y hooks tipados
│   │   ├── hooks.ts
│   │   └── store.ts
│   ├── components/         # Componentes UI globales (Layout, Sidebar, Header, Modales)
│   │   ├── layout/         # AppLayout, AppSidebar, AppHeader
│   │   └── ui/             # Button, Input, Modal, Badge, Table, Card
│   ├── features/           # Módulos por dominio de negocio (Feature-driven)
│   │   ├── asistencias/    # Vistas, componentes y API de asistencias
│   │   ├── auth/           # Login, autenticación, slices y guardas de ruta
│   │   ├── beneficiarios/  # Padrón de beneficiarios y expedientes
│   │   ├── dashboard/      # Métricas ejecutivas y gráficos
│   │   ├── hitos/          # Hitos procesales y estados semafóricos
│   │   ├── justificaciones/# Flujo de solicitudes y revisión de comprobantes
│   │   ├── pantallas/      # Matriz dinámica de permisos por rol (rol_pantalla)
│   │   ├── personas/       # Maestro de ciudadanos y vinculación DNI
│   │   ├── reportes/       # Exportación y resúmenes estadísticos
│   │   ├── roles/          # Gestión de roles institucionales
│   │   └── usuarios/       # Administración de cuentas y accesos
│   ├── shared/             # Utilidades transversales, API base y validadores
│   │   ├── services/       # baseApi (RTK Query con interceptor de token Bearer)
│   │   └── utils/          # cn, formateadores de fecha y helpers
│   ├── App.tsx             # Configuración de rutas y proveedores
│   └── main.tsx            # Punto de entrada de la aplicación
├── package.json            # Dependencias y scripts del proyecto
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración de Vite y alias @/
```

---

## 💻 Instalación y Despliegue

### Requisitos Previos
- **Node.js:** Versión 18.x o superior
- **NPM** o **PNPM**
- Backend de API en ejecución (ejemplo: `http://127.0.0.1:9000/api`)

### 1. Clonar el repositorio
```bash
git clone https://github.com/AntonioSotoAS/control-asistencia-admin.git
cd control-asistencia-admin
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` o `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://127.0.0.1:9000/api
```

### 4. Iniciar en entorno de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 5. Compilación para producción
```bash
npm run build
```
Generará los archivos optimizados listos para servir en la carpeta `/dist`.

---

## 🔒 Seguridad y Permisos por Rol

El sistema implementa dos niveles de seguridad integrados:
1. **Autenticación Bearer:** Tokens emitidos por el backend validados en cada petición mediante `baseApi`.
2. **Autorización Dinámica por Pantallas:** El módulo **Pantallas** permite al administrador activar o desactivar en caliente el acceso a cada pantalla para cualquier rol. La actualización se refleja inmediatamente en el menú lateral de los usuarios conectados mediante invalidación reactiva de RTK Query.

---

## 👨‍💻 Autor

<div align="center">

Desarrollado con dedicación y excelencia técnica por:

### **Antonio Soto**
*Full Stack Developer & Systems Architect*

[![GitHub](https://img.shields.io/badge/GitHub-AntonioSotoAS-181717?style=flat-square&logo=github)](https://github.com/AntonioSotoAS)

---

<sub>Sistema de Control de Asistencia y Gestión Judicial © 2026. Todos los derechos reservados.</sub>

</div>