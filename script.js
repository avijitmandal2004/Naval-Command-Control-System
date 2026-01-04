document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
        document.getElementById("app").style.display = "block";

        applyRole();
        updateDashboard();
        updateStats();
    }, 1500);
});

function updateDashboard() {
    fetch("/get_alert")
        .then(res => res.json())
        .then(data => {
            document.getElementById("offlineBanner").style.display = "none";
            localStorage.setItem("lastAlert", JSON.stringify(data));
            renderDashboard(data);
        })
        .catch(() => {
            document.getElementById("offlineBanner").style.display = "block";
            const cached = localStorage.getItem("lastAlert");
            if (cached) renderDashboard(JSON.parse(cached));
        });
}

function renderDashboard(data) {
    const indicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");
    const severityBadge = document.getElementById("severityBadge");
    const ackButton = document.getElementById("ackButton");

    const role = localStorage.getItem("userRole") || "operator";

    // RESET BUTTON STATE
    ackButton.disabled = true;
    ackButton.style.cursor = "not-allowed";

    if (data.status === "ALERT") {
        indicator.className = "alert";
        statusText.innerText = "🚨 INCIDENT ACTIVE 🚨";

        if (role === "operator") {
            ackButton.disabled = false;
            ackButton.style.cursor = "pointer";
        }
    } 
    else if (data.status === "ACKNOWLEDGED") {
        indicator.className = "safe";
        statusText.innerText = "⚠️ INCIDENT ACKNOWLEDGED";
    } 
    else {
        indicator.className = "safe";
        statusText.innerText = "SYSTEM SAFE";
    }

    severityBadge.innerText = data.severity;
    severityBadge.className = "severity " + data.severity.toLowerCase();

    document.getElementById("message").innerText = data.message;
    document.getElementById("time").innerText = data.time;
    document.getElementById("location").innerText = data.location;
}

function acknowledgeAlert() {
    const role = localStorage.getItem("userRole") || "operator";
    if (role !== "operator") return alert("Only operator can acknowledge");

    fetch("/acknowledge_alert", { method: "POST" })
        .then(res => res.json())
        .then(() => updateDashboard());
}

function updateStats() {
    fetch("/get_stats")
        .then(res => res.json())
        .then(data => {
            document.getElementById("statTotal").innerText = data.total;
            document.getElementById("stat24").innerText = data.last_24_hours;
            document.getElementById("statToday").innerText = data.today;
        });
}

function setRole(role) {
    localStorage.setItem("userRole", role);
    applyRole();
    updateDashboard();
}

function applyRole() {
    const role = localStorage.getItem("userRole") || "operator";
    document.querySelectorAll(".operatorOnly")
        .forEach(el => el.style.display = role === "commander" ? "none" : "block");
}

setInterval(() => {
    updateDashboard();
    updateStats();
}, 2000);
