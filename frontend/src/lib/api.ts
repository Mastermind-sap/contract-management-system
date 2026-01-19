const API_BASE_URL = 'http://localhost:8080/api';

export async function fetchBlueprints() {
  const res = await fetch(`${API_BASE_URL}/blueprints`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch blueprints');
  return res.json();
}

export async function createBlueprint(data: any) {
  const res = await fetch(`${API_BASE_URL}/blueprints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create blueprint');
  return res.json();
}

export async function fetchContracts() {
  const res = await fetch(`${API_BASE_URL}/contracts`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contracts');
  return res.json();
}

export async function createContract(data: any) {
  const res = await fetch(`${API_BASE_URL}/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create contract');
  return res.json();
}

export async function fetchContract(id: string) {
  const res = await fetch(`${API_BASE_URL}/contracts/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contract');
  return res.json();
}

export async function updateContractStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/contracts/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update contract status');
  return res.json();
}
