// Common client-side limits and constants shared across resources

// Maximum allowed size (in bytes) for individual entries in `file_mounts` when creating Blueprints
// NOTE: Empirically, ~131,000 characters is the max shell command length.
// We measure size using UTF-8 encoding (bytes ≈ characters for ASCII content).
export const FILE_MOUNT_MAX_SIZE_BYTES = 131_000;

// Maximum allowed total size (in bytes) across all `file_mounts` when creating Blueprints
// Keep total to 10x the per-file limit to bound overall payload size reasonably.
export const FILE_MOUNT_TOTAL_MAX_SIZE_BYTES = FILE_MOUNT_MAX_SIZE_BYTES * 10;
