# Build stage - Minimal approach to avoid apt-get issues
FROM golang:1.21-alpine AS builder

# Install basic dependencies
RUN apk add --no-cache curl bash ca-certificates git

# Download pre-built Encore binary directly (skip installer script)
RUN curl -L -o /usr/local/bin/encore https://d2f391esomvqpi.cloudfront.net/encore-latest/encore-linux-amd64 && \
    chmod +x /usr/local/bin/encore

# Verify Encore works
RUN encore version || echo "Encore installed but version check may fail"

# Set working directory
WORKDIR /workspace

# Copy the entire backend
COPY . .

# Build the Encore application
RUN encore build --output ./out || \
    (echo "Build failed, checking encore..." && \
     ls -la /usr/local/bin/encore && \
     file /usr/local/bin/encore && \
     exit 1)

# Runtime stage
FROM alpine:latest

# Install runtime dependencies and gcompat for glibc compatibility
RUN apk add --no-cache ca-certificates tzdata gcompat

# Create app user (Alpine commands)
RUN addgroup -g 1000 encore && \
    adduser -D -u 1000 -G encore encore

WORKDIR /app

# Copy the built binary from builder stage
COPY --from=builder --chown=encore:encore /workspace/out /app/

# Switch to non-root user
USER encore

# Expose the port Encore runs on
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/app/backend", "healthcheck"] || exit 1

# Run the application
CMD ["/app/backend"]
