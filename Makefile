.PHONY: dev

dev:
	go run cmd/emvicom/main.go

deps:
	go get -u -t ./...
	go mod tidy
	go mod vendor

build:
	GOOS=linux go build -a -installsuffix cgo -ldflags "-s -w" -o emvicom cmd/emvicom/main.go
