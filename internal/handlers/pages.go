package handlers

import (
	"html/template"
	"log"
	"net/http"

	"github.com/richmondgoh/macro-longevity/internal/models"
	"github.com/richmondgoh/macro-longevity/internal/web"
)

func parseTemplates(files ...string) *template.Template {
	base := "templates/base.html"
	paths := make([]string, len(files)+1)
	paths[0] = base
	for i, f := range files {
		paths[i+1] = f
	}

	tmpl, err := template.New("base.html").Funcs(template.FuncMap{
		"seq": func(n int) []int {
			s := make([]int, n)
			for i := range s {
				s[i] = i
			}
			return s
		},
		"add": func(a, b int) int {
			return a + b
		},
	}).ParseFS(web.TemplatesFS, paths...)
	if err != nil {
		log.Fatal(err)
	}
	return tmpl
}

func Index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	tmpl := parseTemplates("templates/index.html")
	data := models.PageData{
		Title:     "Macro Longevity — Your Biomarker Optimization Guide",
		ActiveNav: "home",
	}
	err := tmpl.Execute(w, data)
	if err != nil {
		log.Printf("template error: %v", err)
	}
}

func Biomarkers(w http.ResponseWriter, r *http.Request) {
	tmpl := parseTemplates("templates/biomarkers.html")
	data := models.PageData{
		Title:      "Biomarkers — Macro Longevity",
		Biomarkers: models.GetBiomarkers(),
		ActiveNav:  "biomarkers",
	}
	err := tmpl.Execute(w, data)
	if err != nil {
		log.Printf("template error: %v", err)
	}
}

func Food(w http.ResponseWriter, r *http.Request) {
	tmpl := parseTemplates("templates/food.html")
	data := models.PageData{
		Title:          "Food — Macro Longevity",
		Foods:          models.GetFoods(),
		FoodCategories: []string{"Protein", "Vegetables", "Fruits", "Healthy Fats", "Complex Carbs"},
		ActiveNav:      "food",
	}
	err := tmpl.Execute(w, data)
	if err != nil {
		log.Printf("template error: %v", err)
	}
}

func Supplements(w http.ResponseWriter, r *http.Request) {
	tmpl := parseTemplates("templates/supplements.html")
	data := models.PageData{
		Title:       "Supplement Stack — Macro Longevity",
		Supplements: models.GetSupplements(),
		ActiveNav:   "supplements",
	}
	err := tmpl.Execute(w, data)
	if err != nil {
		log.Printf("template error: %v", err)
	}
}
