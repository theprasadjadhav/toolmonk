# ── Config ────────────────────────────────────────────────────────────────────
IMAGE         := docker.io/prasadev/toolmonk
RUNNER_IMAGE  := docker.io/prasadev/toolmonk-code-runner
TAG           ?= latest

# Local dev container names and network
NETWORK    := toolmonk-local
APP_CTR    := toolmonk-app
RUNNER_CTR := toolmonk-runner

# Auto-load .env.local — all NEXT_PUBLIC_* vars are picked up automatically
-include .env.local

# ── Targets ───────────────────────────────────────────────────────────────────
.PHONY: build push deploy logs \
        runner-build runner-push runner-deploy runner-logs runner-restart \
        local-build local-up local-down local-logs local-logs-app local-logs-runner \
        test-runner test-runner-security

# ── App ───────────────────────────────────────────────────────────────────────

## Build app image
build:
	docker build \
		--build-arg NEXT_PUBLIC_SITE_URL="$(NEXT_PUBLIC_SITE_URL)" \
		--build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID="$(NEXT_PUBLIC_GA_MEASUREMENT_ID)" \
		--build-arg NEXT_PUBLIC_ADSENSE_PUBLISHER_ID="$(NEXT_PUBLIC_ADSENSE_PUBLISHER_ID)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER="$(NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR="$(NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT="$(NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER="$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER)" \
		-t $(IMAGE):$(TAG) .

## Build + push app image
push: build
	docker push $(IMAGE):$(TAG)

## Deploy app to cluster
deploy:
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/service.yaml
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/ingress.yaml
	kubectl apply -f k8s/pdb.yaml
	kubectl rollout status deployment/toolmonk -n toolmonk

## Tail app logs
logs:
	kubectl logs -n toolmonk -l app=toolmonk --follow

# ── Code Runner ───────────────────────────────────────────────────────────────

## Build runner image (ARM64)
runner-build:
	docker buildx build --platform linux/arm64 \
		-t $(RUNNER_IMAGE):$(TAG) \
		docker/runner/

## Build + push runner image
runner-push: runner-build
	docker push $(RUNNER_IMAGE):$(TAG)

## Deploy runner to cluster
runner-deploy:
	kubectl apply -f k8s/toolmonk-code-runner/namespace.yaml
	kubectl apply -f k8s/toolmonk-code-runner/networkpolicy.yaml
	kubectl apply -f k8s/toolmonk-code-runner/service.yaml
	kubectl apply -f k8s/toolmonk-code-runner/pdb.yaml
	kubectl apply -f k8s/toolmonk-code-runner/deployment.yaml
	kubectl rollout status statefulset/toolmonk-code-runner -n toolmonk-code-runner

## Tail runner logs
runner-logs:
	kubectl logs -n toolmonk-code-runner -l app=toolmonk-code-runner --follow

## Restart runner (pick up new image with same tag)
runner-restart:
	kubectl rollout restart statefulset/toolmonk-code-runner -n toolmonk-code-runner
	kubectl rollout status statefulset/toolmonk-code-runner -n toolmonk-code-runner

# ── Local dev (Docker, no k8s) ────────────────────────────────────────────────
# Build both images and start:   make local-build local-up
# Or just start (images exist):  make local-up
# Tail logs:                     make local-logs-app / local-logs-runner
# Stop everything:               make local-down

## Build both app and runner images for local use (runner built for linux/arm64)
local-build:
	docker buildx build --platform linux/arm64 \
		-t $(RUNNER_IMAGE):$(TAG) \
		docker/runner/
	docker build \
		--build-arg NEXT_PUBLIC_SITE_URL="$(NEXT_PUBLIC_SITE_URL)" \
		--build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID="$(NEXT_PUBLIC_GA_MEASUREMENT_ID)" \
		--build-arg NEXT_PUBLIC_ADSENSE_PUBLISHER_ID="$(NEXT_PUBLIC_ADSENSE_PUBLISHER_ID)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER="$(NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR="$(NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT="$(NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT)" \
		--build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER="$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER)" \
		-t $(IMAGE):$(TAG) .

## Start runner + app containers connected via a local Docker network.
## Runner: http://localhost:2000/health   App: http://localhost:3000
local-up: local-down
	docker network create $(NETWORK) 2>/dev/null || true
	@# Runner — --privileged gives isolate the kernel namespace access it needs.
	@# In production this is handled by SYS_ADMIN capability + seccomp policy in k8s.
	docker run -d \
		--name $(RUNNER_CTR) \
		--network $(NETWORK) \
		--privileged \
		-p 2000:2000 \
		$(RUNNER_IMAGE):$(TAG)
	@echo "Waiting for runner to initialise boxes..."
	@for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do \
		docker exec $(RUNNER_CTR) curl -sf http://localhost:2000/health >/dev/null 2>&1 && echo " ready" && break; \
		printf "."; sleep 2; \
	done
	@docker exec $(RUNNER_CTR) curl -sf http://localhost:2000/health >/dev/null 2>&1 || \
		(echo "ERROR: Runner failed to start — check logs: make local-logs-runner" && exit 1)
	@# App — RUNNER_URL uses container name resolved via the shared Docker network
	docker run -d \
		--name $(APP_CTR) \
		--network $(NETWORK) \
		-e RUNNER_URL=http://$(RUNNER_CTR):2000 \
		-p 3000:3000 \
		$(IMAGE):$(TAG)
	@echo ""
	@echo "  App:    http://localhost:3000"
	@echo "  Runner: http://localhost:2000/health"

## Stop and remove local containers and network
local-down:
	docker rm -f $(APP_CTR) $(RUNNER_CTR) 2>/dev/null || true
	docker network rm $(NETWORK) 2>/dev/null || true

## Tail logs from both containers (run in separate terminals for cleaner output)
local-logs:
	@trap 'kill 0' INT; \
	docker logs -f $(APP_CTR) & \
	docker logs -f $(RUNNER_CTR) & \
	wait

## Tail app logs only
local-logs-app:
	docker logs -f $(APP_CTR)

## Tail runner logs only
local-logs-runner:
	docker logs -f $(RUNNER_CTR)

# ── Tests ─────────────────────────────────────────────────────────────────────

## Run functional integration tests against the local runner
test-runner:
	RUNNER_URL=http://localhost:2000 bun __tests__/integration/runner.ts

## Run security integration tests against the local runner
test-runner-security:
	RUNNER_URL=http://localhost:2000 bun __tests__/integration/runner-security.ts

