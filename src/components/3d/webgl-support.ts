/**
 * Cheap, SSR-safe WebGL capability probe.
 *
 * Creates a throwaway canvas and tries to acquire a WebGL context. Some browsers
 * expose only the legacy `experimental-webgl` identifier, so we try both. Any
 * exception (e.g. context creation blocked) is treated as "no WebGL".
 */
export function detectWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}
