// Deprecated server actions
// NOTE: We standardized on API routes for driver creation/fetching.
// Keep these small shims to fail fast and direct developers to /api/drivers.

export async function createDriver(): Promise<{
  success: false;
  error: string;
}> {
  throw new Error(
    "Server Action createDriver is deprecated. Use the API route POST /api/drivers instead."
  );
}

export async function getDriversAction(): Promise<never> {
  throw new Error(
    "Server Action getDriversAction is deprecated. Use the API route GET /api/drivers instead."
  );
}
