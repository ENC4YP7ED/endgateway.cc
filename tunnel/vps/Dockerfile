FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/vps-tunnel ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata netcat-openbsd
COPY --from=build /bin/vps-tunnel /usr/local/bin/vps-tunnel
VOLUME ["/data"]
EXPOSE 8443
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD nc -z 127.0.0.1 8443 || exit 1
ENTRYPOINT ["/usr/local/bin/vps-tunnel"]
