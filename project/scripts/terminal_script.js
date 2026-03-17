const input = document.getElementById("commandInput");
const output = document.getElementById("output");

let commandHistory = [];
let historyIndex = -1;

// ================= COMMAND DEFINITIONS =================
const commands = {
    help: () => {
        return `
Available commands:
help
clear
freeze
resume
speed <number>
`;
    },

    clear: () => {
        output.innerHTML = "";
        return "";
    },

    freeze: () => {
        window.frozen = true;
        return "Simulation frozen.";
    },

    resume: () => {
        window.frozen = false;
        return "Simulation resumed.";
    },

    speed: (args) => {
        const value = parseFloat(args[0]);
        if (isNaN(value) || value <= 0) {
            return "Invalid speed value.";
        }
        window.worldSpeed = value;
        return `Simulation speed set to ${value}.`;
    }
};

// ================= PARSER =================
function parseCommand(inputText) {
    const parts = inputText.trim().split(" ");
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!commands[commandName]) {
        return `Unknown command: ${commandName}`;
    }

    return commands[commandName](args);
}

// ================= OUTPUT =================
function print(text) {
    if (!text) return;
    output.innerHTML += text + "\n";
    output.scrollTop = output.scrollHeight;
}

// ================= INPUT HANDLING =================
input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        const value = input.value;
        print("> " + value);

        commandHistory.push(value);
        historyIndex = commandHistory.length;

        const result = parseCommand(value);
        print(result);

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
        }
    }
});
