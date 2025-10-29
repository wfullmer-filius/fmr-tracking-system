# ==============================
# Build Stage
# ==============================
FROM golang:1.21-bullseye AS builder

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl bash ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Install Encore CLI (compatible with Debian)
ENV ENCORE_INSTALL="/root/.encore"
ENV PATH="$ENCORE_INSTALL/bin:$PATH"
RUN curl -fsSL https://encore.dev/install.sh | bash

# Verify Encore CLI
RUN encore version

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Build the Encore application for production
# The output directory will contain the compiled binary and runtime files
RUN encore build --production --output ./build

# ==============================
# Runtime Stage
# ==============================
FROM debian:bullseye-slim

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r encore && useradd -r -g encore encore

WORKDIR /app

# Copy the built app from the builder stage
COPY --from=builder --chown=encore:encore /workspace/build /app

# Switch to non-root user
USER encore

# Expose Encore's default port
EXPOSE 4000

# Healthcheck - check if port 4000 responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Run the Encore binary (Encore names it after your app)
# Replace "backend" with your actual service name if different.
CMD ["./backend"]
