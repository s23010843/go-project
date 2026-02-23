# 🌾 Farm Market Price Portal

A small Go web server that serves a static frontend and a JSON price feed for a farm market price portal.

Quick Start
-----------

Prerequisites: Go 1.20+ installed.

From the repository root:

- (optional) Initialize the module only if you haven't already:

	go mod init farm-price-portal

- Run the server:

	go run main.go

- Open your browser at: http://localhost:8080

Project Layout
--------------

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
-----

- The static frontend lives in the `static/` directory and is served by the Go server.
- `prices.json` contains the sample data the frontend reads.
- Edit `main.go` to change server behavior or endpoints.

Deployment
----------

There are two recommended deployment pieces: a static frontend hosted on Netlify (or similar) and a Dockerized Go backend hosted on any container host (Render, VPS, DigitalOcean, AWS ECS, etc.).

1) Netlify (frontend)

- Netlify can publish the `static/` directory directly. A sample `netlify.toml` is included to publish `static/` and to proxy `/api/*` requests to your backend.
- Replace `YOUR_BACKEND_URL` in `netlify.toml` with the public URL of your backend (see Docker backend section below).

2) Dockerized Go backend

- A `Dockerfile` is included to build a minimal static Go image using a multi-stage build. The container serves the frontend and the API on port `8080`.
- To build locally:

```bash
docker build -t farm-price-backend:latest .
```

- To run locally:

```bash
docker run --rm -p 8080:8080 farm-price-backend:latest
```

- Push to a registry (Docker Hub, GitHub Container Registry) and deploy on your preferred host.

Notes on Netlify + Docker
-------------------------

- Netlify itself hosts static sites and serverless functions; it does not run arbitrary long-lived Docker containers. The recommended pattern is:
	- Host the static frontend on Netlify (publish `static/`).
	- Host the Dockerized Go backend on a container host and set `netlify.toml` to proxy `/api/*` to it.

License
-------

This project is licensed under the terms in the `LICENSE` file.

Next steps
----------

- I added `Dockerfile`, `.dockerignore`, and `netlify.toml`.
- Would you like me to also add a small `systemd` unit, a `docker-compose.yml` for local development, or push a GitHub Actions workflow to build and publish the container image automatically?