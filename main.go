package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Price struct {
	Crop   string `json:"crop"`
	Market string `json:"market"`
	Price  int    `json:"price"`
}

// securityHeaders adds hardening headers to every response.
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		// Block MIME-type sniffing
		h.Set("X-Content-Type-Options", "nosniff")
		// Deny embedding in iframes (clickjacking protection)
		h.Set("X-Frame-Options", "DENY")
		// Legacy XSS filter for older browsers
		h.Set("X-XSS-Protection", "1; mode=block")
		// Don't send the full URL as referrer to third parties
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// Restrict browser features we don't need
		h.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()")
		// Content-Security-Policy:
		//   – scripts   : own origin + Chart.js CDN  (unsafe-inline kept for inline handlers)
		//   – styles    : own origin + Google Fonts  (unsafe-inline for inline styles)
		//   – fonts     : Google Fonts static CDN
		//   – connect   : own origin only (API + SW fetch)
		//   – worker    : own origin (service worker)
		//   – everything else: own origin only
		h.Set("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "+
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com; "+
				"img-src 'self' data:; "+
				"connect-src 'self'; "+
				"worker-src 'self'; "+
				"manifest-src 'self'")
		next.ServeHTTP(w, r)
	})
}

// Enable CORS for frontend (Netlify or other domain)
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
}

func getPrices(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	file, err := os.ReadFile("prices.json")
	if err != nil {
		serveErrorPage(w, r, http.StatusInternalServerError)
		return
	}

	var prices []Price
	json.Unmarshal(file, &prices)

	json.NewEncoder(w).Encode(prices)
}

// serveErrorPage renders the matching static error page (404.html / 500.html).
func serveErrorPage(w http.ResponseWriter, r *http.Request, code int) {
	var page string
	switch code {
	case http.StatusNotFound:
		page = "./frontend/dist/404.html"
	default:
		page = "./frontend/dist/500.html"
	}
	content, err := os.ReadFile(page)
	if err != nil {
		// fallback to plain text if the file itself is missing
		http.Error(w, http.StatusText(code), code)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(code)
	w.Write(content)
}

// errorInterceptWriter wraps ResponseWriter so we can catch the status code
// written by http.FileServer and swap in our custom error pages.
type errorInterceptWriter struct {
	http.ResponseWriter
	req        *http.Request
	statusCode int
	hijacked   bool
}

func (ew *errorInterceptWriter) WriteHeader(code int) {
	ew.statusCode = code
	if code == http.StatusNotFound || code == http.StatusInternalServerError {
		ew.hijacked = true
		serveErrorPage(ew.ResponseWriter, ew.req, code)
		return
	}
	ew.ResponseWriter.WriteHeader(code)
}

func (ew *errorInterceptWriter) Write(b []byte) (int, error) {
	if ew.hijacked {
		// discard the original error body; our page has already been written
		return len(b), nil
	}
	return ew.ResponseWriter.Write(b)
}

// customFileServer wraps the standard file server with error-page interception.
func customFileServer(fs http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ew := &errorInterceptWriter{ResponseWriter: w, req: r, statusCode: http.StatusOK}
		fs.ServeHTTP(ew, r)
	})
}

func main() {

	mux := http.NewServeMux()

	// API route
	mux.HandleFunc("/api/prices", getPrices)

	// Serve frontend with custom error pages
	fs := http.FileServer(http.Dir("./frontend/dist"))
	mux.Handle("/", customFileServer(fs))

	// Wrap everything with security headers
	handler := securityHeaders(mux)

	log.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}