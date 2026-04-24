const input = document.getElementById("commandInput");
const output = document.getElementById("output");

// úprava layoutu – prompt řádek nahoru + scrollbar na historii
(function fixTerminalLayout() {
    const centerPanelContent = document.querySelector('.panel.center .content');
    const terminal = document.getElementById('terminal');

    if (centerPanelContent && terminal && output && input) {
        centerPanelContent.style.display = 'flex';
        centerPanelContent.style.flexDirection = 'column';
        centerPanelContent.style.overflow = 'hidden';

        terminal.style.display = 'flex';
        terminal.style.flexDirection = 'column';
        terminal.style.flex = '1';
        terminal.style.overflow = 'hidden';

        // přesunout input-line NAD output (prompt nahoru)
        const inputLine = input.parentElement;
        if (inputLine) {
            terminal.insertBefore(inputLine, output);
            inputLine.style.flex = '0 0 auto';
            inputLine.style.borderBottom = '1px solid #29335C';
        }

        // output pod tím, se scrollbarem
        output.style.flex = '1 1 auto';
        output.style.overflowY = 'auto';
        output.style.minHeight = '0';
    }
})();

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
despawn
spawnenemies
stopspawningenemies
shoot`,

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
    despawn: () => window.despawnShip ? window.despawnShip() : "Command not available.",

    spawnenemies: () => window.spawnenemies ? window.spawnenemies() : "Command not available.",
    stopspawningenemies: () => window.stopspawningenemies ? window.stopspawningenemies() : "Command not available.",
    shoot: () => window.shoot ? window.shoot() : "Command not available."
};

function print(text) {
    if (!text) return;
    output.innerHTML += text.replace(/\n/g, "<br>") + "<br>";
    output.scrollTop = output.scrollHeight;
}

function executeCommand(value) {
    const parts = value.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const result = commands[cmd] ? commands[cmd](args) : `Unknown command: ${cmd}`;
    print(result);
}

input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const value = input.value.trim();
        if (!value) return;

        print(`> ${value}`);
        commandHistory.push(value);
        historyIndex = commandHistory.length;

        executeCommand(value);

        input.value = "";
    }

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

// HOTKEYS – posílají commandy do konzole + ovládají loď
document.addEventListener("keydown", e => {
    if (document.activeElement === input) return;

    const key = e.key.toLowerCase();

    if (key === "w") {
        const cmd = "thrust 1";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
    if (key === "s") {
        const cmd = "brake 1";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
    if (key === "a") {
        const cmd = "rotate -5";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
    if (key === "d") {
        const cmd = "rotate 5";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
    if (key === "x") {
        const cmd = "stop";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
    if (key === " ") {
        e.preventDefault();
        const cmd = "shoot";
        print(`> ${cmd}`);
        executeCommand(cmd);
    }
});
