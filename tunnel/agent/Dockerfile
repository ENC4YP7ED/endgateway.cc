FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /bin/agent ./cmd/agent

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=build /bin/agent /usr/local/bin/mc-agent
WORKDIR /work
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD pidof mc-agent >/dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/mc-agent"]
