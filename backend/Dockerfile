# Build stage - Use Debian (glibc) where Encore binary will work
FROM golang:1.21-bullseye AS builder

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    bash \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set PATH first
ENV PATH="/root/.encore/bin:$PATH"
ENV ENCORE_INSTALL="/root/.encore"

# Install Encore CLI - will work on Debian
RUN curl -L https://encore.dev/install.sh | bash

# Verify installation
RUN encore version

# Set working directory
WORKDIR /workspace

# Copy the entire backend
COPY . .

# Build the Encore application with proper output directory
# Use --output flag instead of docker subcommand
RUN encore build --output ./out

# Runtime stage - Also use Debian for runtime compatibility
FROM debian:bullseye-slim

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
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
