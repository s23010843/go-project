# 🌾 Farm Market Price Portal

Website : https://farmpriceportal.netlify.app/

A small Go web server that serves a static frontend and a JSON price feed for a farm market price portal.

Quick Start

Prerequisites: Go 1.20+ installed.

From the repository root:


	go mod init farm-price-portal


	go run main.go


Project Layout

```
farm-price-portal/
├── go.mod
├── main.go
├── prices.json
└── static/
		├── index.html
		├── style.css
		└── script.js
```

Notes


Deployment

There are two recommended deployment pieces: a static frontend hosted on Netlify (or similar) and a Dockerized Go backend hosted on any container host (Render, VPS, DigitalOcean, AWS ECS, etc.).

1) Netlify (frontend)


2) Dockerized Go backend


```bash
docker build -t farm-price-backend:latest .
```


```bash
docker run --rm -p 8080:8080 farm-price-backend:latest
```


Notes on Netlify + Docker

	- Host the static frontend on Netlify (publish `static/`).
	- Host the Dockerized Go backend on a container host and set `netlify.toml` to proxy `/api/*` to it.

License

This project is licensed under the terms in the `LICENSE` file.