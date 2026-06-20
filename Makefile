.PHONY: run build clean

run:
	go run ./cmd/web

build:
	go build -o server ./cmd/web

clean:
	rm -f server
	rm -f coverage.*
	rm -f *.test
