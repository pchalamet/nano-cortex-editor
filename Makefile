SHELL := /bin/bash
.DEFAULT_GOAL := help

PNPM ?= pnpm
SWIFTC ?= swiftc
NANO_DIST ?= dist
PUBLIC ?= 0

APP_NAME := Nano Cortex Editor
VERSION = $(shell node -p "require('./mac-app/package.json').version")
APP_BUNDLE = $(NANO_DIST)/$(APP_NAME)-darwin-arm64/$(APP_NAME).app
HELPERS := mac-app/native/nano-meter mac-app/native/nano-monitor mac-app/native/nano-spectrum

.PHONY: help install check-version helpers prepare-app build release electron test

help:
	@printf '%s\n' \
	  'make install   Install workspace dependencies from pnpm-lock.yaml' \
	  'make build     Build and ad-hoc sign the macOS app (Apple Silicon)' \
	  'make release   Build without personal pictures and create a release zip' \
	  'make electron  Run the editor in Electron development mode' \
	  'make test      Run the headless Chrome test suite'

install:
	$(PNPM) install --frozen-lockfile

check-version:
	@node -e 'const fs = require("fs"); const app = require("./mac-app/package.json"); const match = fs.readFileSync("index.html", "utf8").match(/const EDITOR_VERSION = '\''([^'\'']+)'\''/); if (!match || match[1] !== app.version) { console.error("Version mismatch: index.html has " + (match ? match[1] : "no EDITOR_VERSION") + ", package.json has " + app.version); process.exit(1); }'

helpers: $(HELPERS)

mac-app/native/nano-%: mac-app/native/nano-%.swift
	$(SWIFTC) -O -target arm64-apple-macos13.0 -o "$@" "$<"

prepare-app:
	rm -rf mac-app/app
	mkdir -p mac-app/app/fonts
	cp index.html mac-app/app/index.html
	cp fonts/OFL-IBM-Plex-Sans.txt mac-app/app/fonts/
	@set -euo pipefail; if [[ "$(PUBLIC)" != "1" && -d img ]]; then \
	  cp -R img mac-app/app/img; \
	  if [[ -f img/icons.css ]]; then \
	    node -e 'const fs = require("fs"); const file = "mac-app/app/index.html"; const css = fs.readFileSync("img/icons.css", "utf8"); fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("</head>", "<style>\n" + css + "</style>\n</head>"));' && \
	    rm mac-app/app/img/icons.css; \
	  fi; \
	fi

# Runtime code uses only Electron/Node built-ins; node_modules contains build tools.
build: check-version install helpers prepare-app
	cd mac-app && $(PNPM) exec electron-packager . "$(APP_NAME)" \
	  --platform=darwin --arch=arm64 --out="$(NANO_DIST)" --overwrite \
	  --icon=assets/icon.icns --app-bundle-id=local.nanocortex.editor \
	  --app-version="$(VERSION)" --extend-info=assets/extend-info.plist \
	  --ignore='^/node_modules' --ignore='^/dist' --ignore='^/assets' --ignore='^/native'
	cd mac-app && cp native/nano-meter native/nano-monitor native/nano-spectrum "$(APP_BUNDLE)/Contents/MacOS/"
	cd mac-app && codesign --force --deep --sign - "$(APP_BUNDLE)"
	@printf 'Built: %s\n' "mac-app/$(APP_BUNDLE)"

release: override PUBLIC = 1
release: build
	mkdir -p release
	rm -f "release/Nano-Cortex-Editor-$(VERSION)-mac-arm64.zip"
	cd mac-app && ditto -c -k --keepParent "$(APP_BUNDLE)" "../release/Nano-Cortex-Editor-$(VERSION)-mac-arm64.zip"

# The native helpers provide audio metering, monitoring and EQ spectrum in development too.
electron: install helpers
	$(PNPM) --dir mac-app exec electron .

test:
	bash tests/run.sh
