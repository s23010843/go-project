# Multi-stage Dockerfile for building a minimal Go server image
FROM golang:1.20-alpine AS builder
WORKDIR /src

# Cache modules
COPY go.mod go.sum ./
RUN go mod download || true

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /src/app main.go

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /src/app .
COPY --from=builder /src/static ./static
COPY --from=builder /src/prices.json ./prices.json
EXPOSE 8080
USER 65532:65532
CMD ["/app/app"]
