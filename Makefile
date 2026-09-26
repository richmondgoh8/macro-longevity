.PHONY: serve audit

serve:
	python3 -m http.server 8080 --bind 127.0.0.1

audit:
	node scripts/audit.mjs
