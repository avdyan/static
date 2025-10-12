class FileManager {
    constructor() {
        this.currentPath = '';
        this.fileStructure = {};
        this.init();
    }

    async init() {
        await this.loadFileStructure();
        this.renderFileManager();
        this.setupEventListeners();
        this.hideLoading();
    }

    // Carga la estructura de archivos desde el archivo JSON generado automáticamente
    async loadFileStructure() {
        try {
            console.log('📥 Cargando estructura de archivos...');
            
            // Intentar cargar desde el archivo generado automáticamente
            const response = await fetch('file-structure.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.fileStructure = data.structure;
            
            console.log(`✅ Estructura cargada exitosamente (generada: ${new Date(data.generated).toLocaleString()})`);
            console.log(`📊 Raíz: ${data.root}`);
            
        } catch (error) {
            console.warn('⚠️ No se pudo cargar file-structure.json, usando estructura por defecto:', error.message);
            console.log('💡 Para generar la estructura automáticamente, ejecuta:');
            console.log('   ./generate-structure.sh  (bash)');
            console.log('   node generate-structure.js  (Node.js)');
            
            // Estructura de fallback en caso de que no exista el archivo JSON
            this.fileStructure = {
                'audio': {
                    type: 'folder',
                    children: {
                        'we fell in love in octobers.mp3': {
                            type: 'audio',
                            size: '487 KB'
                        },
                        'make-u-mine.mp3': {
                            type: 'audio',
                            size: '1.3 MB'
                        }
                    }
                },
                'images': {
                    type: 'folder',
                    children: {
                        'galaxia-hotwheels': {
                            type: 'folder',
                            children: {
                                '1.png': { type: 'image', size: '72.7 KB' },
                                '2.png': { type: 'image', size: '25.3 KB' },
                                '3.png': { type: 'image', size: '102.7 KB' },
                                '4.png': { type: 'image', size: '58.3 KB' },
                                '5.png': { type: 'image', size: '58.6 KB' },
                                'hotwheels-logo.png': { type: 'image', size: '30.0 KB' }
                            }
                        }
                    }
                },
                'css': {
                    type: 'folder',
                    children: {
                        'style.css': { type: 'other', size: '5.7 KB' }
                    }
                },
                'js': {
                    type: 'folder',
                    children: {
                        'main.js': { type: 'other', size: '10.4 KB' }
                    }
                },
                'fonts': {
                    type: 'folder',
                    children: {}
                },
                'index.html': {
                    type: 'other',
                    size: '1.6 KB'
                },
                'README.md': {
                    type: 'other',
                    size: '5.6 KB'
                }
            };
        }
    }

    getCurrentFolder() {
        if (!this.currentPath) return this.fileStructure;
        
        const pathParts = this.currentPath.split('/').filter(part => part);
        let current = this.fileStructure;
        
        for (const part of pathParts) {
            if (current[part] && current[part].children) {
                current = current[part].children;
            }
        }
        
        return current;
    }

    renderFileManager() {
        this.updateBreadcrumb();
        this.renderFiles();
        this.updateBackButton();
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb-path');
        const pathParts = this.currentPath ? this.currentPath.split('/').filter(part => part) : [];
        
        let breadcrumbHTML = '<span class="breadcrumb-item" data-path="">🏠 Root</span>';
        
        let currentPath = '';
        for (let i = 0; i < pathParts.length; i++) {
            currentPath += (currentPath ? '/' : '') + pathParts[i];
            breadcrumbHTML += `
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-item" data-path="${currentPath}">${pathParts[i]}</span>
            `;
        }
        
        breadcrumb.innerHTML = breadcrumbHTML;
    }

    updateBackButton() {
        const backButton = document.querySelector('.back-button');
        if (this.currentPath) {
            backButton.classList.remove('hidden');
        } else {
            backButton.classList.add('hidden');
        }
    }

    renderFiles() {
        const fileGrid = document.querySelector('.file-grid');
        const currentFolder = this.getCurrentFolder();
        
        if (!currentFolder || Object.keys(currentFolder).length === 0) {
            fileGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #718096; padding: 40px;">📭 Esta carpeta está vacía</div>';
            return;
        }

        let filesHTML = '';
        
        // Ordenar archivos: carpetas primero, luego archivos
        const sortedEntries = Object.entries(currentFolder).sort(([nameA, itemA], [nameB, itemB]) => {
            if (itemA.type === 'folder' && itemB.type !== 'folder') return -1;
            if (itemA.type !== 'folder' && itemB.type === 'folder') return 1;
            return nameA.localeCompare(nameB);
        });

        for (const [name, item] of sortedEntries) {
            const fileType = item.type || 'other';
            const fileSize = item.size || '';
            
            filesHTML += `
                <div class="file-item ${fileType}" data-name="${name}" data-type="${fileType}">
                    <div class="file-icon"></div>
                    <div class="file-name">${name}</div>
                    ${fileSize ? `<div class="file-size">${fileSize}</div>` : ''}
                </div>
            `;
        }
        
        fileGrid.innerHTML = filesHTML;
    }

    setupEventListeners() {
        // Navegación de archivos
        document.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                this.handleFileClick(fileItem);
                return;
            }

            // Navegación breadcrumb
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            if (breadcrumbItem) {
                this.navigateToPath(breadcrumbItem.dataset.path);
                return;
            }

            // Botón atrás
            if (e.target.closest('.back-button')) {
                this.goBack();
                return;
            }

            // Cerrar modal
            if (e.target.closest('.preview-close') || e.target.closest('.preview-modal')) {
                if (e.target.classList.contains('preview-modal') || e.target.closest('.preview-close')) {
                    this.closePreview();
                }
                return;
            }
        });

        // Esc key para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
            }
        });
    }

    handleFileClick(fileItem) {
        const fileName = fileItem.dataset.name;
        const fileType = fileItem.dataset.type;

        if (fileType === 'folder') {
            // Navegar a la carpeta
            this.navigateToPath(this.currentPath ? `${this.currentPath}/${fileName}` : fileName);
        } else {
            // Mostrar preview del archivo
            this.showPreview(fileName, fileType);
        }
    }

    navigateToPath(path) {
        this.currentPath = path;
        this.renderFileManager();
    }

    goBack() {
        if (!this.currentPath) return;
        
        const pathParts = this.currentPath.split('/').filter(part => part);
        pathParts.pop();
        this.currentPath = pathParts.join('/');
        this.renderFileManager();
    }

    showPreview(fileName, fileType) {
        const modal = document.querySelector('.preview-modal');
        const content = document.querySelector('.preview-content');
        
        const fullPath = this.currentPath ? `${this.currentPath}/${fileName}` : fileName;
        
        let previewHTML = `
            <button class="preview-close">&times;</button>
            <h3 style="margin-bottom: 20px; color: #4a5568;">${fileName}</h3>
        `;

        if (fileType === 'image') {
            previewHTML += `<img src="${fullPath}" alt="${fileName}" class="preview-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                           <div style="display: none; text-align: center; padding: 40px; color: #718096;">❌ No se pudo cargar la imagen</div>`;
        } else if (fileType === 'audio') {
            previewHTML += `
                <audio controls class="preview-audio">
                    <source src="${fullPath}" type="audio/mpeg">
                    Tu navegador no soporta el elemento audio.
                </audio>
                <div style="text-align: center; margin-top: 15px; color: #718096;">
                    🎵 Reproductor de audio
                </div>`;
        } else {
            previewHTML += `
                <div style="text-align: center; padding: 40px; color: #718096;">
                    📄 Vista previa no disponible para este tipo de archivo
                    <br><br>
                    <a href="${fullPath}" download="${fileName}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                        ⬇️ Descargar archivo
                    </a>
                </div>`;
        }

        content.innerHTML = previewHTML;
        modal.classList.add('active');
    }

    closePreview() {
        const modal = document.querySelector('.preview-modal');
        modal.classList.remove('active');
        
        // Pausar audio si está reproduciéndose
        const audio = modal.querySelector('audio');
        if (audio) {
            audio.pause();
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }
}

// Inicializar el file manager cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new FileManager();
});

// Funciones de utilidad
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (audioExtensions.includes(extension)) return 'audio';
    if (videoExtensions.includes(extension)) return 'video';
    
    return 'other';
}