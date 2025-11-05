// Common client-side limits and constants shared across resources

// Maximum allowed size (in bytes) for individual entries in `file_mounts` when creating Blueprints
// NOTE: Empirically, ~131,000 characters is the max shell command length that works post Base64 encoding.
// Base64 expands data by ~4/3, so the pre-encoded limit is floor(131,000 * 3 / 4) ≈ 98,250 bytes.
// We measure size using UTF-8 encoding (bytes ≈ characters for ASCII content).
export const FILE_MOUNT_MAX_SIZE_BYTES = 98_250;

// Maximum allowed total size (in bytes) across all `file_mounts` when creating Blueprints
// Keep total to 10x the per-file limit to bound overall payload size reasonably.
export const FILE_MOUNT_TOTAL_MAX_SIZE_BYTES = 98_250 * 10;
