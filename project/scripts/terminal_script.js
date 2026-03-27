const input = document.getElementById("commandInput");
const output = document.getElementById("output");

let commandHistory = [];
let historyIndex = -1;

const commands = {
    help: () => `Available commands:
help
clear
freeze
resume
speed <number>
spawnship
thrust <0-1>
brake <0-1>
rotate <degrees>
stop
shipstatus
despawn`,

    clear: () => { output.innerHTML = ""; return ""; },
    freeze: () => { window.frozen = true; return "Simulation frozen."; },
    resume: () => { window.frozen = false; return "Simulation resumed."; },
    speed: (args) => {
        const val = parseFloat(args[0]);
        if (isNaN(val) || val <= 0) return "Invalid speed value.";
        window.worldSpeed = val;
        return `Simulation speed set to ${val}.`;
    },

    spawnship: () => window.spawnShip ? window.spawnShip() : "Ship system not loaded.",
    thrust: (args) => window.setThrust ? window.setThrust(args[0]) : "Command not available.",
    brake: (args) => window.setBrake ? window.setBrake(args[0]) : "Command not available.",
    rotate: (args) => window.setRotate ? window.setRotate(args[0]) : "Command not available.",
    stop: () => window.stopShip ? window.stopShip() : "Command not available.",
    shipstatus: () => window.getShipStatus ? window.getShipStatus() : "Command not available.",
    despawn: () => window.despawnShip ? window.despawnShip() : "Command not available."
};

function print(text) {
    if (!text) return;
    output.innerHTML += text.replace(/\n/g, "<br>") + "<br>";
    output.scrollTop = output.scrollHeight;
}

input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const value = input.value.trim();
        if (!value) return;

        print(`> ${value}`);
        commandHistory.push(value);
        historyIndex = commandHistory.length;

        const parts = value.split(" ");
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        const result = commands[cmd] ? commands[cmd](args) : `Unknown command: ${cmd}`;
        print(result);

        input.value = "";
    }

    // historie šipkami
    if (e.key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    }
    if (e.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            input.value = "";
            historyIndex = commandHistory.length;
        }
    }
});