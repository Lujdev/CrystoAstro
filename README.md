# CrystoDolar

CrystoDolar es una aplicación web moderna desarrollada con **Astro** y **React** para visualizar la cotización del dólar en Venezuela en tiempo real. Obtiene tasas de diversas fuentes (BCV, Binance P2P, etc.) y ofrece herramientas como una calculadora de conversión.

## 🚀 Tecnologías

Este proyecto utiliza un stack tecnológico moderno optimizado para rendimiento y experiencia de usuario:

- **Framework Core:** [Astro](https://astro.build) (Optimizado para contenido estático y rapidez).
- **UI Library:** [React](https://react.dev) (Para componentes interactivos como la calculadora y tabs).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com) (Estilizado utilitario y sistema de diseño).
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com) (Componentes accesibles y personalizables).
- **Gráficos:** [Recharts](https://recharts.org) (Visualización de historial de precios).
- **Iconos:** [Lucide React](https://lucide.dev) & Google Material Icons.
- **Tipografía:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── calculator/    # Componentes de la calculadora de conversión
│   ├── history/       # Gráficos y estadísticas históricas
│   ├── layout/        # Header, Footer, ThemeToggle
│   ├── rates/         # Cards de tasas, Grid, Tabs y AverageCard
│   └── ui/            # Componentes base de Shadcn (Button, Card, etc.)
├── layouts/
│   └── BaseLayout.astro  # Layout principal con SEO y estilos base
├── lib/
│   ├── api.ts         # Cliente API para obtener tasas
│   ├── format.ts      # Utilidades de formateo de moneda y fechas
│   └── utils.ts       # Utilidades generales (cn helper)
├── pages/
│   ├── index.astro    # Página de inicio
│   ├── historico.astro # Página de historial
│   └── terminos.astro  # Términos y condiciones
├── styles/
│   └── globals.css    # Variables CSS, temas (Claro/Oscuro) y estilos globales
└── types/
    └── rates.ts       # Definiciones de tipos TypeScript
```

## 🛠️ Configuración y Scripts

### Prerrequisitos
- Node.js (v18+)
- pnpm (Recomendado)

### Instalación
```bash
pnpm install
```

### Desarrollo
Iniciar el servidor de desarrollo local:
```bash
pnpm run dev
```

### Construcción (Build)
Generar la versión de producción estática:
```bash
pnpm build
```

### Linting y Formateo
Este proyecto utiliza **Biome** para linting y formateo rápido.
```bash
pnpm run check      # Verificar problemas
pnpm run check:write # Corregir problemas automáticamente
```

## 🌍 SEO y Despliegue

La aplicación está configurada con:
- **Sitemap automático:** Generado por `@astrojs/sitemap`.
- **Robots.txt:** Configurado para indexación.
- **Datos Estructurados (JSON-LD):** Schema `WebSite` para mejor entendimiento por buscadores.
- **Meta Tags:** Título, descripción y Open Graph optimizados.

URL de producción: [https://crystodolarvzla.site/](https://crystodolarvzla.site/)

## 🎨 Temas
Soporte nativo para **Modo Claro** y **Modo Oscuro**, detectando la preferencia del sistema y permitiendo cambio manual.
