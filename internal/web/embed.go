package web

import "embed"

//go:embed templates/*.html
var TemplatesFS embed.FS

//go:embed static/css/*.css
var StaticFS embed.FS
