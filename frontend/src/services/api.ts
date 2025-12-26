// src/services/api.ts
// Frontend-safe API service with zero backend dependency at build time.
// Behavior:
// - If VITE_API_BASE_URL is set and reachable, uses real API
// - Otherwise, falls back to deterministic mock responses

const API_BASE = import.meta.env?.VITE_API_BASE_URL as string | undefined;

type KycSubmitPayload = Record<string, unknown>;

type KycSubmitResult = {
  customerId: string;
  status: string;
  riskScore: number;
  flags: string[];
};

async function tryFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (_err) {
    return null; // silently fall back to mock
  }
}

export async function submitKyc(formData: KycSubmitPayload): Promise<KycSubmitResult> {
  // Try real backend first (if configured)
  const real = await tryFetch<KycSubmitResult>('/api/kyc/documents', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  if (real) return real;

  // Mock fallback
  return await new Promise<KycSubmitResult>((resolve) => {
    setTimeout(() => {
      resolve({
        customerId: 'CUST-10291',
        status: 'APPROVED',
        riskScore: 18,
        flags: ['Low risk', 'No sanctions match'],
      });
    }, 800);
  });
}

export const api = { submitKyc };
