let startTime = Date.now();

function updateLiveInfo() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('live-time').textContent = `${timeStr} | ONLINE | PING 12ms`;

  const secs = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  document.getElementById('uptime').textContent = `Uptime ...... ${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m`;

  document.getElementById('cpu').textContent = `CPU .......... ${25 + Math.floor(Math.random()*20)}%`;
  document.getElementById('memory').textContent = `Memory ....... ${300 + Math.floor(Math.random()*80)}/512 GB`;
}
setInterval(updateLiveInfo, 1000);
updateLiveInfo();

function toggleUI() {
  const ui = document.getElementById('mainUI');
  const btn = document.getElementById('hide_button');

  if (ui.classList.contains('is-hidden')) {
    // SHOW
    ui.classList.remove('is-hidden');
    btn.textContent = "HIDE TERMINAL";
    btn.style.backgroundColor = "#ac0707";
  } else {
    // HIDE
    ui.classList.add('is-hidden');
    btn.textContent = "SHOW TERMINAL";
    btn.style.backgroundColor = "#0a0";
  }
}

// Resizer
const resizer = document.getElementById('resizer');
const terminalUI = document.getElementById('mainUI');
let isResizing = false;

resizer.addEventListener('mousedown', () => isResizing = true);

document.addEventListener('mousemove', e => {
  if (!isResizing) return;
  const newHeight = window.innerHeight - e.clientY;
  if (newHeight > 220 && newHeight < window.innerHeight - 100) {
    terminalUI.style.height = newHeight + 'px';
  }
});

document.addEventListener('mouseup', () => isResizing = false);

// Color buttons
function changeUIRandom() {
  const c1 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
  const c3 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
  document.body.style.backgroundColor = c1;
  document.querySelectorAll('.header, .footer, .functioningbuttons, .panel-title').forEach(el => el.style.backgroundColor = c3);
}

function changeUIPreset() {
  document.body.style.backgroundColor = "#E4572E";
  document.querySelectorAll('.header, .footer, .functioningbuttons, .panel-title').forEach(el => el.style.backgroundColor = "#29335C");
}

function TEST() {
  const output = document.getElementById("output");
  output.innerHTML += "TEST command executed.<br>";
  output.scrollTop = output.scrollHeight;
}