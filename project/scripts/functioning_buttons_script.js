let posledniBarva = "#E4572E";
let posledniBarva2 = "#29335C";
let posledniBarva3 = "#F3A712";

function toggleUI() {
  const ui = document.getElementById('mainUI');
  const btn = document.getElementById('hide_button');

  ui.classList.toggle('is-hidden');
  
  if (ui.classList.contains('is-hidden')) {
    btn.innerText = "SHOW TERMINAL";
    document.body.style.backgroundColor = "white";
  } else {
    btn.innerText = "HIDE TERMINAL";
    document.body.style.backgroundColor = posledniBarva;
  }
}



function changeUIRandom() {
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  posledniBarva = randomColor;
  const randomColor2 = '#' + Math.floor(Math.random() * 16737215).toString(16).padStart(6, '0');
  posledniBarva2 = randomColor2;
  const randomColor3 = '#' + Math.floor(Math.random() * 16777615).toString(16).padStart(6, '0');
  posledniBarva3 = randomColor3;

  document.body.style.backgroundColor = posledniBarva;
  document.body.style.color = posledniBarva2;
  document.querySelectorAll('.panel-title').forEach(el => {el.style.color = posledniBarva2;});
  document.querySelectorAll('#randomUIcolor, #presetUIcolor, #TEST').forEach(el => {el.style.border = `2px solid ${posledniBarva2}`;});
  document.querySelectorAll('#randomUIcolor, #presetUIcolor, #TEST, .header, .panel-title, .footer').forEach(el => {el.style.backgroundColor = `${posledniBarva3}`;});
  

}

function changeUIPreset() {
  posledniBarva = "#E4572E";
  posledniBarva2 = "#F3A712";
  posledniBarva3 = "#29335C";
  document.body.style.backgroundColor = posledniBarva;
  document.body.style.color = posledniBarva2;
  document.querySelectorAll('.panel-title').forEach(el => {el.style.color = posledniBarva2;});
  document.querySelectorAll('#randomUIcolor, #presetUIcolor, #TEST').forEach(el => {el.style.border = `2px solid ${posledniBarva2}`;});
  document.querySelectorAll('#randomUIcolor, #presetUIcolor, #TEST, .header, .panel-title, .footer').forEach(el => {el.style.backgroundColor = `${posledniBarva3}`;});

  console.log("Nová barva:", posledniBarva);
}