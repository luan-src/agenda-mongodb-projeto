'use strict';
const $ = (selector) => document.querySelector(selector);
const state = { eventos: [], editingId: null, pessoas: [] };
const messages = $('#mensagem');

function notify(message = '') { messages.textContent = message; }
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
function localeDate(iso) {
  const d = new Date(iso);
  return { dia: new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(d), mes: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).replace('.', '').toUpperCase(),
    completo: new Intl.DateTimeFormat('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d), horario: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d) };
}
function localDateTime(iso) {
  const d = new Date(iso); const n = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${n(d.getMonth()+1)}-${n(d.getDate())}T${n(d.getHours())}:${n(d.getMinutes())}`;
}
function create(tag, cls, content) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (content !== undefined) el.textContent = content;
  return el;
}
function emptyList(title, subtitle) { const div = create('div', 'empty'); div.append(create('strong', '', title), create('span', '', subtitle)); return div; }

function render() {
  const term = $('#busca').value.trim().toLocaleLowerCase('pt-BR');
  const filter = $('#filtro').value;
  const now = Date.now();
  const visible = state.eventos.filter(event => {
    const timestamp = new Date(event.dataHorario).getTime();
    const keep = filter === 'todos' || (filter === 'futuros' ? timestamp >= now : timestamp < now);
    const haystack = [event.titulo, event.descricao, ...event.pessoas.map(person => person.nome)].join(' ').toLocaleLowerCase('pt-BR');
    return keep && haystack.includes(term);
  });
  $('#total').textContent = `${state.eventos.length} compromisso${state.eventos.length === 1 ? '' : 's'} cadastrado${state.eventos.length === 1 ? '' : 's'}`;
  const list = $('#lista'); list.replaceChildren();
  if (!visible.length) { list.append(emptyList('Nenhum compromisso encontrado', 'Cadastre um compromisso ou altere os filtros.')); return; }
  for (const event of visible) {
    const date = localeDate(event.dataHorario);
    const article = create('article', 'event');
    const dateBox = create('div', 'datebox'); dateBox.append(create('strong', '', date.dia), create('span', '', date.mes));
    const info = create('div', 'event-content');
    info.append(create('h3', '', event.titulo));
    if (event.descricao) info.append(create('p', '', event.descricao));
    info.append(create('div', 'meta', `◷ ${date.completo} às ${date.horario}`));
    const chips = create('div', 'chips');
    if (!event.pessoas.length) chips.append(create('span', 'chip', 'Sem participantes'));
    for (const person of event.pessoas) chips.append(create('span', 'chip', person.nome));
    info.append(chips);
    const actions = create('div', 'event-actions');
    const edit = create('button', 'small', '✎ Editar'); edit.type = 'button'; edit.addEventListener('click', () => openEditor(event));
    const people = create('button', 'small', '♙ Pessoas'); people.type = 'button'; people.addEventListener('click', () => openEditor(event, true));
    const del = create('button', 'small danger', '🗑 Excluir'); del.type = 'button'; del.addEventListener('click', () => removeEvent(event));
    actions.append(edit, people, del); article.append(dateBox, info, actions); list.append(article);
  }
}
async function load() {
  try { state.eventos = await request('/api/compromissos'); notify(); render(); }
  catch (error) { notify(error.message); }
}
function renderPeople() {
  const list = $('#pessoas'); list.replaceChildren();
  if (!state.pessoas.length) list.append(create('span', 'hint', 'Nenhuma pessoa adicionada.'));
  state.pessoas.forEach((person, index) => {
    const chip = create('span', 'person', person.nome); const remove = create('button', '', '×');
    remove.type = 'button'; remove.setAttribute('aria-label', `Remover ${person.nome}`);
    remove.addEventListener('click', () => removePerson(index));
    chip.append(remove); list.append(chip);
  });
}
function openEditor(event = null, focusPeople = false) {
  state.editingId = event?._id || null;
  state.pessoas = event ? event.pessoas.map(person => ({ ...person })) : [];
  $('#dialog-title').textContent = event ? 'Editar compromisso' : 'Novo compromisso';
  $('#dataHorario').value = event ? localDateTime(event.dataHorario) : localDateTime(new Date(Date.now() + 3600000).toISOString());
  $('#titulo').value = event?.titulo || '';
  $('#descricao').value = event?.descricao || '';
  $('#nome-pessoa').value = '';
  renderPeople(); $('#editor').showModal();
  (focusPeople ? $('#nome-pessoa') : $('#titulo')).focus();
}
function addPerson() {
  const nome = $('#nome-pessoa').value.trim();
  if (!nome) { $('#nome-pessoa').focus(); return; }
  if (nome.length > 120) { alert('O nome deve ter até 120 caracteres.'); return; }
  if (state.pessoas.length >= 50) { alert('Limite de 50 pessoas por compromisso.'); return; }
  if (state.pessoas.some(p => p.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'))) { alert('Essa pessoa já está no compromisso.'); return; }
  state.pessoas.push({ nome }); $('#nome-pessoa').value = ''; renderPeople(); $('#nome-pessoa').focus();
}
async function removePerson(index) {
  const person = state.pessoas[index];
  if (!person) return;
  if (state.editingId && person.id) {
    if (!confirm(`Excluir ${person.nome} deste compromisso?`)) return;
    try {
      await request(`/api/compromissos/${state.editingId}/pessoas/${person.id}`, { method: 'DELETE' });
      state.pessoas.splice(index, 1); renderPeople(); await load();
    } catch (error) { alert(error.message); }
  } else { state.pessoas.splice(index, 1); renderPeople(); }
}
async function saveEvent(event) {
  event.preventDefault();
  const title = $('#titulo').value.trim(), descricao = $('#descricao').value.trim(), date = $('#dataHorario').value;
  if (!title || !date) { alert('Preencha título, data e horário.'); return; }
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) { alert('Data e horário inválidos.'); return; }
  const pending = $('#nome-pessoa').value.trim();
  if (pending) addPerson();
  const button = $('#salvar'); button.disabled = true;
  try {
    const base = { titulo: title, descricao, dataHorario: parsed.toISOString() };
    if (state.editingId) {
      const id = state.editingId;
      await request(`/api/compromissos/${id}`, { method: 'PATCH', body: JSON.stringify(base) });
      // A API atualiza a lista completa de participantes mantendo nomes individuais.
      await request(`/api/compromissos/${id}/pessoas`, { method: 'PUT', body: JSON.stringify({ pessoas: state.pessoas }) });
    } else {
      await request('/api/compromissos', { method: 'POST', body: JSON.stringify({ ...base, pessoas: state.pessoas }) });
    }
    $('#editor').close(); await load();
  } catch (error) { alert(error.message); } finally { button.disabled = false; }
}
async function removeEvent(event) {
  if (!confirm(`Excluir definitivamente o compromisso “${event.titulo}”?`)) return;
  try { await request(`/api/compromissos/${event._id}`, { method: 'DELETE' }); await load(); }
  catch (error) { notify(error.message); }
}
$('#novo').addEventListener('click', () => openEditor());
$('#fechar').addEventListener('click', () => $('#editor').close());
$('#cancelar').addEventListener('click', () => $('#editor').close());
$('#adicionar-pessoa').addEventListener('click', addPerson);
$('#nome-pessoa').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); addPerson(); } });
$('#form-compromisso').addEventListener('submit', saveEvent);
$('#busca').addEventListener('input', render);
$('#filtro').addEventListener('change', render);
load();
