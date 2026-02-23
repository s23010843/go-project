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

// Enable CORS for frontend (Netlify or other domain)
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
}

func getPrices(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	file, err := os.ReadFile("prices.json")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var prices []Price
	json.Unmarshal(file, &prices)

	json.NewEncoder(w).Encode(prices)
}

func main() {

	// API route
	http.HandleFunc("/api/prices", getPrices)

	// Serve frontend
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	log.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}