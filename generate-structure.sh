#!/bin/bash

# Script para generar automáticamente la estructura de archivos
# Alternativa en bash para usuarios sin Node.js

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
IGNORED_FILES=(".DS_Store" ".git" ".gitignore" "node_modules" "generate-structure.js" "generate-structure.sh" "file-structure.json" ".gitkeep")
OUTPUT_FILE="file-structure.json"

# Extensiones de archivo
AUDIO_EXTENSIONS=("mp3" "wav" "ogg" "aac" "flac" "m4a" "wma")
IMAGE_EXTENSIONS=("jpg" "jpeg" "png" "gif" "bmp" "svg" "webp" "ico")
VIDEO_EXTENSIONS=("mp4" "avi" "mov" "wmv" "flv" "webm" "mkv")

# Contadores para estadísticas
declare -i FOLDER_COUNT=0
declare -i FILE_COUNT=0
declare -i IMAGE_COUNT=0
declare -i AUDIO_COUNT=0
declare -i VIDEO_COUNT=0
declare -i OTHER_COUNT=0

echo -e "${BLUE}🔍 Escaneando estructura de archivos...${NC}"

# Función para verificar si un archivo debe ser ignorado
should_ignore() {
    local filename="$1"
    
    # Ignorar archivos que empiecen con punto
    if [[ "$filename" == .* ]]; then
        return 0
    fi
    
    # Verificar lista de archivos ignorados
    for ignored in "${IGNORED_FILES[@]}"; do
        if [[ "$filename" == "$ignored" ]]; then
            return 0
        fi
    done
    
    return 1
}

# Función para obtener el tipo de archivo
get_file_type() {
    local filename="$1"
    local extension="${filename##*.}"
    extension=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    
    # Verificar si es imagen
    for ext in "${IMAGE_EXTENSIONS[@]}"; do
        if [[ "$extension" == "$ext" ]]; then
            echo "image"
            return
        fi
    done
    
    # Verificar si es audio
    for ext in "${AUDIO_EXTENSIONS[@]}"; do
        if [[ "$extension" == "$ext" ]]; then
            echo "audio"
            return
        fi
    done
    
    # Verificar si es video
    for ext in "${VIDEO_EXTENSIONS[@]}"; do
        if [[ "$extension" == "$ext" ]]; then
            echo "video"
            return
        fi
    done
    
    echo "other"
}

# Función para formatear el tamaño de archivo
format_file_size() {
    local bytes=$1
    
    if (( bytes == 0 )); then
        echo "0 Bytes"
        return
    fi
    
    local -a sizes=("Bytes" "KB" "MB" "GB")
    local i=0
    local size=$bytes
    
    while (( size >= 1024 && i < 3 )); do
        size=$((size / 1024))
        ((i++))
    done
    
    # Usar bc para decimales si está disponible, sino usar enteros
    if command -v bc >/dev/null 2>&1; then
        local formatted=$(echo "scale=1; $bytes / (1024^$i)" | bc)
        echo "${formatted} ${sizes[$i]}"
    else
        echo "${size} ${sizes[$i]}"
    fi
}

# Función para escapar JSON strings
json_escape() {
    local string="$1"
    # Escapar caracteres especiales para JSON
    string="${string//\\/\\\\}"
    string="${string//\"/\\\"}"
    string="${string//$'\t'/\\t}"
    string="${string//$'\n'/\\n}"
    string="${string//$'\r'/\\r}"
    echo "$string"
}

# Función recursiva para generar la estructura
generate_structure() {
    local dir_path="$1"
    local relative_path="$2"
    local indent="$3"
    local is_last="$4"
    
    local first_item=true
    local items=()
    
    # Leer todos los elementos del directorio
    while IFS= read -r -d '' item; do
        local basename=$(basename "$item")
        if ! should_ignore "$basename"; then
            items+=("$item")
        fi
    done < <(find "$dir_path" -maxdepth 1 -mindepth 1 -print0 | sort -z)
    
    local total_items=${#items[@]}
    local current_item=0
    
    for item in "${items[@]}"; do
        ((current_item++))
        local basename=$(basename "$item")
        local item_relative_path="$relative_path"
        
        if [[ -n "$relative_path" ]]; then
            item_relative_path="$relative_path/$basename"
        else
            item_relative_path="$basename"
        fi
        
        local is_last_item=false
        if (( current_item == total_items )); then
            is_last_item=true
        fi
        
        if [[ ! "$first_item" == true ]]; then
            echo ","
        fi
        first_item=false
        
        printf '%s"%s": {' "$indent" "$(json_escape "$basename")"
        
        if [[ -d "$item" ]]; then
            # Es un directorio
            ((FOLDER_COUNT++))
            printf '\n%s  "type": "folder",' "$indent"
            printf '\n%s  "path": "%s",' "$indent" "$(json_escape "$item_relative_path")"
            printf '\n%s  "children": {' "$indent"
            
            # Verificar si el directorio tiene contenido válido
            local has_children=false
            while IFS= read -r -d '' child; do
                local child_basename=$(basename "$child")
                if ! should_ignore "$child_basename"; then
                    has_children=true
                    break
                fi
            done < <(find "$item" -maxdepth 1 -mindepth 1 -print0)
            
            if [[ "$has_children" == true ]]; then
                printf '\n'
                generate_structure "$item" "$item_relative_path" "$indent    " "$is_last_item"
                printf '\n%s  }' "$indent"
            else
                printf '}'
            fi
            
        else
            # Es un archivo
            ((FILE_COUNT++))
            local file_type=$(get_file_type "$basename")
            local file_size=$(stat -f%z "$item" 2>/dev/null || echo "0")
            local formatted_size=$(format_file_size "$file_size")
            local last_modified=$(stat -f%Sm -t%Y-%m-%dT%H:%M:%S "$item" 2>/dev/null || date -Iseconds)
            
            # Incrementar contador según el tipo
            case "$file_type" in
                "image") ((IMAGE_COUNT++)) ;;
                "audio") ((AUDIO_COUNT++)) ;;
                "video") ((VIDEO_COUNT++)) ;;
                "other") ((OTHER_COUNT++)) ;;
            esac
            
            printf '\n%s  "type": "%s",' "$indent" "$file_type"
            printf '\n%s  "size": "%s",' "$indent" "$(json_escape "$formatted_size")"
            printf '\n%s  "path": "%s",' "$indent" "$(json_escape "$item_relative_path")"
            printf '\n%s  "lastModified": "%s"' "$indent" "${last_modified}Z"
        fi
        
        printf '\n%s}' "$indent"
    done
}

# Función principal
main() {
    local target_dir="${1:-.}"
    local absolute_path=$(cd "$target_dir" && pwd)
    
    # Generar timestamp
    local timestamp=$(date -Iseconds)
    
    # Inicializar archivo JSON
    {
        echo "{"
        echo "  \"generated\": \"$timestamp\","
        echo "  \"root\": \"$(json_escape "$absolute_path")\","
        echo "  \"structure\": {"
        
        # Generar estructura
        generate_structure "$target_dir" "" "    " true
        
        echo ""
        echo "  }"
        echo "}"
    } > "$OUTPUT_FILE"
    
    echo -e "${GREEN}✅ Estructura generada exitosamente!${NC}"
    echo -e "${GREEN}📄 Archivo creado: $OUTPUT_FILE${NC}"
    
    # Mostrar estadísticas
    echo -e "\n${YELLOW}📊 Estadísticas:${NC}"
    echo -e "${BLUE}📁 Carpetas: $FOLDER_COUNT${NC}"
    echo -e "${BLUE}📄 Archivos: $FILE_COUNT${NC}"
    echo -e "${BLUE}🖼️  Imágenes: $IMAGE_COUNT${NC}"
    echo -e "${BLUE}🎵 Audio: $AUDIO_COUNT${NC}"
    echo -e "${BLUE}🎬 Video: $VIDEO_COUNT${NC}"
    echo -e "${BLUE}📄 Otros: $OTHER_COUNT${NC}"
}

# Ejecutar función principal
main "$@"