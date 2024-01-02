.PHONY: all compile browserfy deploy restart

all: compile browserfy deploy restart

build: compile browserfy

compile:
	@echo "Compiling TypeScript"
	@tsc -p ./tsconfig.json

browserfy:
	@echo "Browserfying the web files"
	@for file in build/web/*.js; do \
		filename=$$(basename "$$file"); \
		bundle_output="web/$${filename%.*}.js"; \
		browserify "$$file" -o "$$bundle_output"; \
	done

deploy:
	@echo "Deploying files to ~/webstore/frontend"
	@cp web/* ~/webstore/frontend/web
	@cp build/app/*.js ~/webstore/frontend/src/
	@cp build/app/packages/*.js ~/webstore/frontend/src/packages
	@cp icons/* ~/webstore/frontend/icons
	@cp -r node_modules ~/webstore/frontend/node_modules

restart:
	@echo "Restarting web-shop-orders service"
	@sudo service web-shop-orders restart