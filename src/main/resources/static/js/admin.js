const e=id=>document.querySelector(id),h=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));async function load(){let[d,i,a,l]=await Promise.all(['/api/admin/dashboard','/api/admin/incidents','/api/admin/analytics','/api/admin/audit-logs'].map(x=>fetch(x).then(r=>r.json())));e('#stats').innerHTML=Object.entries(d[0]).map(x=>`<b>${x[0]}: ${x[1]}</b>`).join('<br>');e('#incidents').innerHTML=i.map(x=>`<article><b>${h(x.incident_code)}</b> ${h(x.incident_type)} · ${h(x.severity)} · ${h(x.status)} <button onclick="assign(${x.id})">Assign officer</button></article>`).join('')||'No incidents.';e('#analytics').innerHTML=a.map(x=>`${h(x.severity)}: ${x.total}`).join('<br>');e('#audit').innerHTML=l.map(x=>`<small>${h(x.created_at)} ${h(x.action)} ${h(x.detail)}</small><br>`).join('')}async function assign(id){let officerId=prompt('Security officer ID');if(officerId){let r=await fetch(`/api/admin/incidents/${id}/assign?officerId=${officerId}`,{method:'POST'});if(!r.ok)alert((await r.json()).detail||'Assignment failed');load()}}load();
(function () {
  function addAlertPanel() {
    if (document.getElementById("admin-alert-panel")) return;

    const panel = document.createElement("section");
    panel.id = "admin-alert-panel";
    panel.style.cssText = "margin-top:24px;padding:24px;background:#fff;border:1px solid #ddd;border-radius:12px;";

    panel.innerHTML = `
      <h2 style="margin-top:0;">Emergency Alert Control</h2>
      <p style="color:#666;">Send an alert to students on campus.</p>

      <div style="display:grid;gap:12px;max-width:650px;">
        <input id="alert-title"
          placeholder="Alert title"
          style="padding:12px;border:1px solid #bbb;border-radius:6px;">

        <textarea id="alert-message"
          placeholder="Alert message"
          rows="4"
          style="padding:12px;border:1px solid #bbb;border-radius:6px;"></textarea>

        <select id="alert-severity"
          style="padding:12px;border:1px solid #bbb;border-radius:6px;">
          <option value="INFO">INFO</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <button id="send-alert"
          style="padding:12px;background:#0b63ce;color:white;border:0;border-radius:6px;cursor:pointer;font-weight:bold;">
          Send Emergency Alert
        </button>

        <div id="alert-result"></div>
      </div>
    `;

    const main = document.querySelector("main");
    if (main) {
      main.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    document.getElementById("send-alert").addEventListener("click", async function () {
      const title = document.getElementById("alert-title").value.trim();
      const message = document.getElementById("alert-message").value.trim();
      const severity = document.getElementById("alert-severity").value;
      const result = document.getElementById("alert-result");

      if (!title || !message) {
        result.textContent = "Please enter both a title and message.";
        result.style.color = "crimson";
        return;
      }

      const body = new URLSearchParams();
      body.append("title", title);
      body.append("message", message);
      body.append("severity", severity);

      try {
        const response = await fetch("/api/admin/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: body.toString()
        });

        if (!response.ok) {
          throw new Error("Alert request failed");
        }

        result.textContent = "Emergency alert sent successfully.";
        result.style.color = "green";

        document.getElementById("alert-title").value = "";
        document.getElementById("alert-message").value = "";
        document.getElementById("alert-severity").value = "INFO";
      } catch (error) {
        result.textContent = "Failed to send alert.";
        result.style.color = "crimson";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addAlertPanel);
  } else {
    addAlertPanel();
  }
})();
