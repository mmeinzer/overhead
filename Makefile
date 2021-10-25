## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

# ==================================================================================== #
# BUILD
# ==================================================================================== #

## build: build the application
.PHONY: build
build:
	@echo 'Building app...'
	npm run build

## run: run the application
.PHONY: run
run:
	@echo 'Running app...'
	npm start

## format: format the application
.PHONY: format
format:
	@echo 'Formatting app...'
	npm run format
