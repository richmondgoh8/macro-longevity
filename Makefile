.DEFAULT_GOAL := run
.PHONY: run serve audit

PORT ?= 8081

run:
	@printf 'Macro Longevity: http://127.0.0.1:%s/\n' "$(PORT)"
	python3 -m http.server $(PORT) --bind 127.0.0.1

serve: run

audit:
	node scripts/audit.mjs
