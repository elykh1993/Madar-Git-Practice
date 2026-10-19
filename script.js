/* Madar: a small, dependency-free study planner. */
(() => {
  'use strict';
  const STORAGE_KEY = 'madar.tasks.v1';
  const $ = (selector) => document.querySelector(selector);
  const initialTasks = [
    { id: 'example-1', title: 'مرور واژگان زبان', priority: 'high', done: true },
    { id: 'example-2', title: 'حل تمرین درس جدید', priority: 'medium', done: false },
    { id: 'example-3', title: 'مطالعه ۲۰ صفحه کتاب', priority: 'low', done: false },
  ];
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return initialTasks;
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return initialTasks;
      return data.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && ['low','medium','high'].includes(t.priority)).map(t => ({ ...t, done: !!t.done }));
    } catch { return initialTasks; }
  }
  let tasks = loadTasks();
  let filter = 'all';
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* Storage might be disabled. */ } }
  function fa(n) { return new Intl.NumberFormat('fa-IR').format(n); }
  const list = $('#task-list');
  function render() {
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const remaining = total - done;
    const percent = total ? Math.round((done / total) * 100) : 0;
    $('#stat-total').textContent = fa(total);
    $('#stat-done').textContent = fa(done);
    $('#stat-remaining').textContent = fa(remaining);
    $('#task-count').textContent = `${fa(total)} کار`;
    $('#progress-number').textContent = `${fa(percent)}٪`;
    $('#progress-bar').style.width = `${percent}%`;
    $('#progress-caption').textContent = total ? `${fa(done)} کار از ${fa(total)} کار انجام شده. ادامه بده!` : 'با تکمیل کارها، این نوار پر می‌شود.';
    list.replaceChildren();
    const visible = tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
    $('#empty-message').hidden = visible.length !== 0;
    visible.forEach(t => {
      const li = document.createElement('li'); li.className = `task-item${t.done ? ' completed' : ''}`;
      const check = document.createElement('input'); check.type = 'checkbox'; check.className = 'task-checkbox'; check.checked = t.done; check.setAttribute('aria-label', `تکمیل ${t.title}`);
      check.addEventListener('change', () => { t.done = check.checked; save(); render(); });
      const label = document.createElement('span'); label.className = 'task-label'; label.textContent = t.title;
      const tag = document.createElement('span'); tag.className = `priority-tag ${t.priority}`; tag.textContent = { high: 'مهم', medium: 'متوسط', low: 'کم' }[t.priority];
      const del = document.createElement('button'); del.type = 'button'; del.className = 'delete-task'; del.textContent = '×'; del.title = 'حذف کار'; del.setAttribute('aria-label', `حذف ${t.title}`);
      del.addEventListener('click', () => { tasks = tasks.filter(item => item.id !== t.id); save(); render(); });
      li.append(check, label, tag, del); list.append(li);
    });
    document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
  }
  $('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#task-input'); const title = input.value.trim();
    if (!title) return;
    tasks.unshift({ id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title, priority: $('#priority').value, done: false });
    input.value = ''; save(); render(); input.focus();
  });
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render(); }));
  const today = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#today-date').textContent = today.format(new Date());
  let seconds = 25 * 60; let interval = null;
  const display = $('#timer-display'); const start = $('#timer-start'); const hint = $('#timer-hint');
  function updateTimer() { const m = Math.floor(seconds / 60); const s = seconds % 60; display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; document.title = interval ? `${display.textContent} | مدار` : 'مدار | برنامه‌ریز مطالعه'; }
  function stopTimer() { if (interval) clearInterval(interval); interval = null; start.textContent = 'شروع تمرکز'; updateTimer(); }
  start.addEventListener('click', () => {
    if (interval) { stopTimer(); hint.textContent = 'تایمر متوقف شد؛ هر وقت خواستی ادامه بده.'; return; }
    start.textContent = 'توقف موقت'; hint.textContent = 'این زمان فقط برای تو و هدفت است.';
    interval = setInterval(() => {
      seconds = Math.max(0, seconds - 1); updateTimer();
      if (seconds === 0) { stopTimer(); hint.textContent = 'آفرین! یک دور تمرکز کامل شد. کمی استراحت کن 🌿'; }
    }, 1000);
    updateTimer();
  });
  $('#timer-reset').addEventListener('click', () => { stopTimer(); seconds = 25 * 60; updateTimer(); hint.textContent = '۲۵ دقیقه تمرکز، سپس کمی استراحت.'; });
  render(); updateTimer();
})();
