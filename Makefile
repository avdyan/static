# File Manager - Makefile
# Comandos para generar automáticamente la estructura de archivos

.PHONY: help build serve clean rebuild dev install

# Colores para output
GREEN=\033[0;32m
BLUE=\033[0;34m
YELLOW=\033[1;33m
NC=\033[0m

help: ## Mostrar esta ayuda
	@echo "$(BLUE)📁 File Manager - Comandos disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Generar estructura de archivos (Node.js)
	@echo "$(BLUE)🔄 Generando estructura con Node.js...$(NC)"
	@node generate-structure.js

build-bash: ## Generar estructura de archivos (Bash)
	@echo "$(BLUE)🔄 Generando estructura con Bash...$(NC)"
	@bash generate-structure.sh

serve: ## Iniciar servidor local (puerto 8000)
	@echo "$(GREEN)🚀 Iniciando servidor en http://localhost:8000$(NC)"
	@python -m http.server 8000

serve-node: ## Iniciar servidor con Node.js
	@echo "$(GREEN)🚀 Iniciando servidor Node.js...$(NC)"
	@npx http-server -p 8000 -o

dev: build serve ## Generar estructura y iniciar servidor

dev-bash: build-bash serve ## Generar estructura (bash) y iniciar servidor

clean: ## Limpiar archivos generados
	@echo "$(YELLOW)🧹 Limpiando archivos generados...$(NC)"
	@rm -f file-structure.json

rebuild: clean build ## Limpiar y regenerar estructura

rebuild-bash: clean build-bash ## Limpiar y regenerar estructura (bash)

install: ## Instalar dependencias de Node.js
	@echo "$(BLUE)📦 Instalando dependencias...$(NC)"
	@npm install

watch: ## Observar cambios y regenerar automáticamente
	@echo "$(BLUE)👀 Observando cambios... (Ctrl+C para parar)$(NC)"
	@while true; do \
		make build; \
		echo "$(GREEN)✅ Estructura actualizada - $(shell date)$(NC)"; \
		sleep 5; \
	done

# Aliases útiles
start: dev ## Alias para 'dev'
server: serve ## Alias para 'serve'
update: rebuild ## Alias para 'rebuild'