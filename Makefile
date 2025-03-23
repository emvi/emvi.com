.PHONY: dev

dev:
	go run cmd/emvicom/main.go

deps:
	go get -u -t ./...
	go mod tidy
	go mod vendor
