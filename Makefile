.PHONY: serve audit

serve:
	fuser -k -TERM 8080/tcp 2>/dev/null || true
	python3 -m http.server 8080 --bind 127.0.0.1

audit:
	node scripts/audit.mjs
