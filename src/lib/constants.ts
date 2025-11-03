// Common client-side limits and constants shared across resources

// Maximum allowed size (in bytes) for individual entries in `file_mounts` when creating Blueprints
// NOTE: Capped at ~786,000 bytes to align with the approximate macOS maximum shell command length
// when embedding base64-encoded content. Since base64 is ASCII, bytes ≈ characters here, and we
// measure size using UTF-8 encoding.
export const FILE_MOUNT_MAX_SIZE_BYTES = 786_000;

// Maximum allowed total size (in bytes) across all `file_mounts` when creating Blueprints
export const FILE_MOUNT_TOTAL_MAX_SIZE_BYTES = 786_000 * 10; // ~10 mb

