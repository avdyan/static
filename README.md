# 📁 File Manager - Static Server

Un file manager web moderno y elegante que muestra automáticamente todos los recursos de tus carpetas de manera visual e interactiva.

## ✨ Características

- **🎨 Interfaz Moderna**: Diseño con glassmorphism y gradientes suaves
- **📱 Responsive**: Perfectamente adaptado para móvil y escritorio
- **🗂ï File Navigation**: Navegación intuitiva entre carpetas y archivos
- **🖼️ Vista Previa**: Preview de imágenes con modal interactivo
- **🎵 Reproductor**: Reproducción de archivos de audio directamente en el navegador
- **📍 Breadcrumbs**: Navegación por rutas fácil de usar
- **🔍 Iconos Categorizados**: Diferentes iconos y colores según el tipo de archivo
- **⚡ Carga Rápida**: Interfaz optimizada con estados de carga

## 🚀 Cómo usar

### Generación Automática de Estructura

**¡Ahora la estructura se genera automáticamente!** No necesitas modificar código manualmente.

#### Opción 1: Con Node.js
```bash
# Generar estructura automáticamente
node generate-structure.js

# O usar npm scripts
npm run build
```

#### Opción 2: Con Bash (sin Node.js)
```bash
# Generar estructura automáticamente
./generate-structure.sh

# O usar Makefile
make build-bash
```

#### Opción 3: Con Makefile (más cómodo)
```bash
# Ver todos los comandos disponibles
make help

# Generar y servir automáticamente
make dev          # Con Node.js
make dev-bash     # Con bash
```

### Usar el File Manager

1. **Generar estructura**: Ejecuta uno de los comandos anteriores
2. **Abrir el proyecto**: Abre `index.html` en tu navegador o usa `make serve`
3. **Navegar**: Haz clic en las carpetas para explorar su contenido
4. **Ver archivos**: Haz clic en archivos para vista previa:
   - **Imágenes**: Se muestran en un modal con tamaño completo
   - **Audio**: Reproductor integrado con controles
   - **Otros**: Opción de descarga directa
5. **Volver atrás**: Usa el botón "Atrás" o los breadcrumbs para navegar

## 💻 Comandos Disponibles

### NPM Scripts
```bash
npm run build         # Generar estructura (Node.js)
npm run build:bash    # Generar estructura (Bash)
npm run dev           # Generar y servir con Python
npm run serve         # Solo servir (Python)
npm run serve:node    # Servir con Node.js
npm run clean         # Limpiar archivos generados
npm run rebuild       # Limpiar y regenerar
```

### Makefile Commands
```bash
make help            # Mostrar ayuda
make build           # Generar estructura (Node.js)
make build-bash      # Generar estructura (Bash)
make serve           # Servir con Python
make serve-node      # Servir con Node.js
make dev             # Generar + servir (Node.js)
make dev-bash        # Generar + servir (Bash)
make clean           # Limpiar archivos
make rebuild         # Limpiar + regenerar
make watch           # Regenerar automáticamente cada 5s
```

### Scripts Directos
```bash
./generate-structure.sh              # Bash script
node generate-structure.js           # Node.js script
python -m http.server 8000          # Servidor Python
```

## 📂 Estructura del Proyecto

```
static/
├── index.html          # Página principal del file manager
├── css/
│   └── style.css       # Estilos modernos con glassmorphism
├── js/
│   └── main.js         # Lógica del file manager
├── audio/              # Archivos de audio
│   ├── we fell in love in octobers.mp3
│   └── make-u-mine.mp3
├── images/             # Imágenes y gráficos
│   └── galaxia-hotwheels/
│       ├── 1.png
│       ├── 2.png
│       ├── 3.png
│       ├── 4.png
│       ├── 5.png
│       └── hotwheels-logo.png
├── fonts/              # Fuentes (vacío por ahora)
└── README.md           # Este archivo
```

## 🎨 Características del Diseño

### Paleta de Colores
- **Fondo principal**: Gradiente púrpura-azul (#667eea → #764ba2)
- **Contenedores**: Glassmorphism con blur y transparencia
- **Carpetas**: Gradiente naranja cálido (#ffeaa7 → #fab1a0)
- **Audio**: Gradiente púrpura-rosa (#a29bfe → #fd79a8)
- **Imágenes**: Gradiente verde-cyan (#55efc4 → #81ecec)
- **Otros archivos**: Gradiente naranja (#e17055 → #fdcb6e)

### Efectos Visuales
- **Glassmorphism**: Fondo translúcido con blur
- **Hover Effects**: Elevación suave y cambios de sombra
- **Smooth Transitions**: Animaciones fluidas de 0.3s
- **Drop Shadows**: Sombras sutiles para profundidad

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica moderna
- **CSS3**: 
  - Flexbox y CSS Grid para layouts
  - Custom Properties (variables CSS)
  - Backdrop-filter para glassmorphism
  - Keyframe animations
- **JavaScript ES6+**:
  - Classes y módulos
  - Async/await
  - Event delegation
  - Template literals

## 📱 Responsive Design

El file manager está completamente optimizado para dispositivos móviles:

- **Grid adaptativo**: Se ajusta automáticamente al tamaño de pantalla
- **Touch-friendly**: Botones y áreas de toque optimizadas
- **Modal responsive**: Vista previa adaptada para móviles
- **Tipografía escalable**: Tamaños de fuente que se adaptan

## 🎯 Tipos de Archivo Soportados

### 🖼️ Imágenes
- JPG, JPEG, PNG, GIF, BMP, SVG, WebP
- Vista previa en modal con zoom
- Manejo de errores de carga

### 🎵 Audio
- MP3, WAV, OGG, AAC, FLAC
- Reproductor HTML5 integrado
- Controles de reproducción completos

### 📁 Carpetas
- Navegación jerárquica
- Breadcrumb navigation
- Indicador visual distintivo

### 📄 Otros Archivos
- CSS, JS, HTML, MD, TXT, etc.
- Opción de descarga directa
- Información de tamaño de archivo

## 🎮 Controles y Navegación

### Teclado
- **ESC**: Cerrar modal de vista previa
- **Clic**: Navegar/abrir archivos

### Ratón/Touch
- **Hover**: Efectos visuales en archivos
- **Clic simple**: Navegar o previsualizar
- **Modal**: Clic fuera para cerrar

## 🔧 Personalización

### Agregar Nuevos Archivos
Para agregar archivos al file manager, actualiza el objeto `fileStructure` en `js/main.js`:

```javascript
this.fileStructure = {
    'nueva-carpeta': {
        type: 'folder',
        children: {
            'archivo.png': {
                type: 'image',
                size: '150 KB'
            }
        }
    }
};
```

### Modificar Estilos
Todos los estilos están centralizados en `css/style.css` con variables CSS para fácil personalización.

## 🚀 Mejoras Futuras

- [ ] Integración con API real del servidor
- [ ] Soporte para video preview
- [ ] Sistema de búsqueda
- [ ] Ordenamiento por fecha/tamaño/nombre
- [ ] Selección múltiple de archivos
- [ ] Funciones de administración (subir, eliminar)
- [ ] Temas personalizables
- [ ] Modo oscuro/claro

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¡Disfruta explorando tus archivos de manera visual y moderna! 🎉**

# static

A simple repository for serving static files.

## Directory Structure

```
.
├── index.html       # Main entry point
├── css/             # CSS stylesheets
├── js/              # JavaScript files
├── images/          # Image assets
└── fonts/           # Font files
```

## Usage

Place your static files in the appropriate directories:
- Put CSS files in the `css/` folder
- Put JavaScript files in the `js/` folder
- Put images in the `images/` folder
- Put fonts in the `fonts/` folder

The `index.html` file serves as the main entry point for your static site.
