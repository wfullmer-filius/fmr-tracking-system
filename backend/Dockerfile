# Build stage
FROM golang:1.21-alpine AS builder

# Install dependencies
RUN apk add --no-cache curl bash ca-certificates git

# Set PATH first
ENV PATH="/root/.encore/bin:$PATH"
ENV ENCORE_INSTALL="/root/.encore"

# Create encore directory
RUN mkdir -p /root/.encore/bin

# Download and install Encore using the official install script
# The script will handle the download URL correctly
RUN curl -L https://encore.dev/install.sh > /tmp/install.sh && \
    chmod +x /tmp/install.sh && \
    bash /tmp/install.sh

# Verify installation
RUN ls -la /root/.encore/bin/ && \
    /root/.encore/bin/encore version || \
    (echo "Encore binary:" && ls -la /root/.encore/bin/encore && exit 1)

# Set working directory
WORKDIR /workspace

# Copy the entire backend
COPY . .

# Build the Encore application
RUN /root/.encore/bin/encore build --output ./out

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata gcompat libgcc libstdc++

# Create app user
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
