package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/richmondgoh/macro-longevity/internal/handlers"
	"github.com/richmondgoh/macro-longevity/internal/web"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	staticSub, err := fs.Sub(web.StaticFS, "static")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticSub))))

	mux.HandleFunc("GET /", handlers.Index)
	mux.HandleFunc("GET /biomarkers", handlers.Biomarkers)
	mux.HandleFunc("GET /food", handlers.Food)
	mux.HandleFunc("GET /supplements", handlers.Supplements)

	addr := ":" + port
	host := "http://localhost:" + port
	log.Printf("listening on %s", host)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
