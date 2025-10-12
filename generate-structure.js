#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class FileStructureGenerator {
    constructor() {
        this.ignoredFiles = new Set([
            '.DS_Store',
            '.git',
            '.gitignore',
            'node_modules',
            'generate-structure.js',
            'file-structure.json',
            '.gitkeep'
        ]);
        
        this.audioExtensions = new Set(['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']);
        this.imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico']);
        this.videoExtensions = new Set(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']);
    }

    getFileType(fileName, isDirectory) {
        if (isDirectory) return 'folder';
        
        const extension = path.extname(fileName).toLowerCase().slice(1);
        
        if (this.imageExtensions.has(extension)) return 'image';
        if (this.audioExtensions.has(extension)) return 'audio';
        if (this.videoExtensions.has(extension)) return 'video';
        
        return 'other';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    shouldIgnoreFile(fileName) {
        return this.ignoredFiles.has(fileName) || fileName.startsWith('.');
    }

    scanDirectory(dirPath, relativePath = '') {
        const structure = {};
        
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                if (this.shouldIgnoreFile(item.name)) {
                    continue;
                }
                
                const fullPath = path.join(dirPath, item.name);
                const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
                
                if (item.isDirectory()) {
                    // Es una carpeta
                    const children = this.scanDirectory(fullPath, itemRelativePath);
                    structure[item.name] = {
                        type: 'folder',
                        children: children,
                        path: itemRelativePath
                    };
                } else {
                    // Es un archivo
                    const stats = fs.statSync(fullPath);
                    const fileType = this.getFileType(item.name, false);
                    
                    structure[item.name] = {
                        type: fileType,
                        size: this.formatFileSize(stats.size),
                        path: itemRelativePath,
                        lastModified: stats.mtime.toISOString()
                    };
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error.message);
        }
        
        return structure;
    }

    generateStructure(rootPath = '.') {
        console.log('🔍 Escaneando estructura de archivos...');
        
        const absolutePath = path.resolve(rootPath);
        const structure = this.scanDirectory(absolutePath);
        
        const result = {
            generated: new Date().toISOString(),
            root: absolutePath,
            structure: structure
        };
        
        // Escribir el archivo JSON
        const outputPath = path.join(rootPath, 'file-structure.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        
        console.log('✅ Estructura generada exitosamente!');
        console.log(`📄 Archivo creado: ${outputPath}`);
        
        // Mostrar estadísticas
        this.showStats(structure);
        
        return result;
    }

    showStats(structure) {
        const stats = this.calculateStats(structure);
        
        console.log('\n📊 Estadísticas:');
        console.log(`📁 Carpetas: ${stats.folders}`);
        console.log(`📄 Archivos: ${stats.files}`);
        console.log(`🖼️  Imágenes: ${stats.images}`);
        console.log(`🎵 Audio: ${stats.audio}`);
        console.log(`🎬 Video: ${stats.video}`);
        console.log(`📄 Otros: ${stats.other}`);
    }

    calculateStats(structure) {
        let stats = {
            folders: 0,
            files: 0,
            images: 0,
            audio: 0,
            video: 0,
            other: 0
        };

        for (const [name, item] of Object.entries(structure)) {
            if (item.type === 'folder') {
                stats.folders++;
                const childStats = this.calculateStats(item.children);
                stats.folders += childStats.folders;
                stats.files += childStats.files;
                stats.images += childStats.images;
                stats.audio += childStats.audio;
                stats.video += childStats.video;
                stats.other += childStats.other;
            } else {
                stats.files++;
                stats[item.type]++;
            }
        }

        return stats;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const generator = new FileStructureGenerator();
    
    // Obtener el directorio desde argumentos o usar el actual
    const targetDir = process.argv[2] || '.';
    
    try {
        generator.generateStructure(targetDir);
    } catch (error) {
        console.error('❌ Error generando estructura:', error.message);
        process.exit(1);
    }
}

module.exports = FileStructureGenerator;