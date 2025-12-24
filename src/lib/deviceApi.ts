import { DEVICE_PROXY_URL } from "@/config/deviceConfig";

export async function triggerGate() {
  const resp = await fetch(`${DEVICE_PROXY_URL}/api/trigger-gate`, { method: 'POST' });
  if (!resp.ok) throw new Error('Failed to trigger gate');
  return resp.json();
}

export async function getGateStatus() {
  const resp = await fetch(`${DEVICE_PROXY_URL}/api/gate-status`);
  if (!resp.ok) throw new Error('Failed to fetch gate status');
  return resp.json();
}

export async function toggleExteriorLights() {
  const resp = await fetch(`${DEVICE_PROXY_URL}/api/toggle-lights`, { method: 'POST' });
  if (!resp.ok) throw new Error('Failed to toggle lights');
  return resp.json();
} 

export async function getDeviceStatus(mac: string) {
  const body = new URLSearchParams({ mac });
  const resp = await fetch(`${DEVICE_PROXY_URL}/api/device-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error('Failed to fetch device status');
  return resp.json();
}

export async function getDeviceAuth() {
  const resp = await fetch(`${DEVICE_PROXY_URL}/api/auth`);
  if (!resp.ok) throw new Error('Failed to fetch device auth');
  return resp.json();
}
