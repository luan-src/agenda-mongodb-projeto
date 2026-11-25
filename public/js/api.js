'use strict';
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  } catch { throw new Error('Não foi possível conectar ao servidor.'); }
  if (!response.ok) {
    let error;
    try { error = await response.json(); } catch {}
    throw new Error(error?.erro || `Falha na operação (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}
