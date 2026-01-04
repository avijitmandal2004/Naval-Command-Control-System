fetch("http://127.0.0.1:5000/get_history")
    .then(res => res.json())
    .then(data => {
        const timeline = document.getElementById("timeline");

        // Latest first
        data.reverse().forEach(item => {
            const div = document.createElement("div");
            div.className = "timelineItem " + item.severity.toLowerCase();

            div.innerHTML = `
                <div class="timelineTime">${item.time}</div>
                <div class="timelineMessage">
                    ${item.severity} — ${item.message}
                </div>
                <div class="timelineLocation">
                    📍 ${item.location}
                </div>
            `;

            timeline.appendChild(div);
        });
    });
    function exportCSV() {
    fetch("http://127.0.0.1:5000/get_history")
        .then(res => res.json())
        .then(data => {

            let csv = "Time,Severity,Message,Location\n";

            data.forEach(item => {
                csv += `${item.time},${item.severity},${item.message},${item.location}\n`;
            });

            // Create downloadable file
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "incident_logs.csv";
            a.click();

            window.URL.revokeObjectURL(url);
        });
}
