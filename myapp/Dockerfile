# Rust backend Docker image
FROM rust:1.80-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./
COPY migration ./migration

# Copy source code
COPY src ./src
COPY build.rs ./
COPY config ./config
COPY assets ./assets

# Build the application
RUN cargo build --release

# Expose port
EXPOSE 5150

# Set environment variables
ENV RUST_LOG=info
ENV LOCO_ENV=development

# Run the application
CMD ["cargo", "loco", "start"]