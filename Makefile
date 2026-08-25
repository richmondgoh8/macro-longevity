.PHONY: serve audit

serve:
	@kill $$(lsof -ti:8080) 2>/dev/null; sleep 0.5; python3 -m http.server 8080

audit:
	node scripts/audit.mjs
