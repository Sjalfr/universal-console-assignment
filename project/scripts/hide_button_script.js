function toggleUI() {
  const ui = document.getElementById('mainUI'); // This matches the ID we added
  const btn = document.getElementById('hide_button'); // This matches the ID we added

  ui.classList.toggle('is-hidden');
  
  if (ui.classList.contains('is-hidden')) {
    btn.innerText = "SHOW TERMINAL";
    document.body.style.backgroundColor = "white";
  } else {
    btn.innerText = "HIDE TERMINAL";
    document.body.style.backgroundColor = "#E4572E";
  }
}