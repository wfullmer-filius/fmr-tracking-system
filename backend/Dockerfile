# ===========================
# Build Stage
# ===========================
FROM golang:1.21-bullseye AS builder

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    bash \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set PATH and Encore install location
ENV PATH="/root/.encore/bin:$PATH"
ENV ENCORE_INSTALL="/root/.encore"

# 🩵 Workaround for FIPS mode blocking non-approved crypto
# Disable FIPS temporarily for build (some Go crypto funcs may use MD5 internally)
ENV OPENSSL_FIPS=0

# Install Encore CLI
RUN curl -L https://encore.dev/install.sh | bash

# Verify installation
RUN encore version

# Set working directory
WORKDIR /workspace

# Copy the entire backend
COPY . .

# ✅ Build the Encore app (correct command)
# This generates a production-ready Docker image definition inside /workspace
RUN encore build docker

# ===========================
# Runtime Stage
# ===========================
FROM debian:bullseye-slim

# Re-enable FIPS if desired for runtime
# (Uncomment the next line if you need strict FIPS enforcement)
# ENV OPENSSL_FIPS=1

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -g 1000 encore && \
    useradd -r -u 1000 -g encore encore

WORKDIR /app

# Copy built app from builder (Encore docker build output location)
COPY --from=builder --chown=encore:encore /workspace/.encore/docker /app/

# Switch to non-root user
USER encore

# Expose default Encore port
EXPOSE 4000

# Health check (update binary name if different)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/app/backend", "healthcheck"] || exit 1

# Run the Encore application
CMD ["/app/backend"]
