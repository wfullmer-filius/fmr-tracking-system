# Build stage - Use Debian-based image instead of Alpine
FROM golang:1.21-bookworm AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set PATH for Encore before installing
ENV PATH="/root/.encore/bin:$PATH"

# Install Encore CLI
RUN curl -L https://encore.dev/install.sh | bash

# Verify Encore installation
RUN encore version

# Set working directory
WORKDIR /workspace

# Copy the entire backend
COPY . .

# Build the Encore application
RUN encore build --output ./out

# Runtime stage - Use Debian slim for better compatibility
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -g 1000 encore && \
    useradd -r -u 1000 -g encore encore

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
