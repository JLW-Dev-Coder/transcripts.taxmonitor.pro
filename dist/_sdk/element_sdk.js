/* _sdk/element_sdk.js */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[c] || c;
    });
  }

  function toast(message, tone) {
    const container = $("toast-container");
    if (!container) return;

    const el = document.createElement("div");
    el.className =
      "fixed bottom-6 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur " +
      (tone === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-100"
        : "border-white/10 bg-slate-950/40 text-white/90");

    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => el.classList.add("opacity-0"), 2600);
    setTimeout(() => el.remove(), 3100);
  }

  function setActiveSection(sectionId) {
    const sections = document.querySelectorAll(".page-section");
    sections.forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add("active");
  }

  function showPage(sectionId) {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.showPage = showPage;

  function initHashRouting() {
    const hash = (location.hash || "").replace("#", "");
    if (!hash) return;

    // If it matches a section on the landing page, keep landing-page active and scroll.
    const target = document.getElementById(hash);
    if (target) {
      setActiveSection("landing-page");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Otherwise, if hash is a page-section, activate it.
    const section = document.getElementById(hash);
    if (section && section.classList.contains("page-section")) {
      showPage(hash);
    }
  }

  async function handleLeadForm() {
    const form = $("lead-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = $("lead-name")?.value?.trim() || "";
      const email = $("lead-email")?.value?.trim() || "";
      const firm = $("lead-firm")?.value?.trim() || "";

      if (!email) {
        toast("Email is required.", "error");
        return;
      }

      // This is intentionally “no assumptions”: you can wire the backend later.
      // For now, just confirm capture.
      toast("Saved. Check your email for the guide link.", "ok");

      // Optional: if you later add a Worker endpoint, this is where it goes.
      // window.tmData?.post?.("https://api.taxmonitor.pro/forms/lead-magnet/transcript-ebook", { email, firm, name });

      form.reset();
      showPage("landing-page");
    });
  }

  function buildFreeReportShell() {
    return `
      <div class="report-page">
        <div class="report-content">
          <div class="report-header">
            <div>
              <div class="report-h1">IRS Transcript Report</div>
              <div class="report-kicker">Transcript.Tax Monitor Pro</div>
            </div>
            <div style="text-align:right">
              <div class="report-kicker">Generated</div>
              <div style="font-weight:800">${escapeHtml(new Date().toLocaleDateString())}</div>
            </div>
          </div>

          <div class="report-section">
            <div class="report-title">Summary</div>
            <div class="report-summary">
              This is a preview report format. Your real report would list transcript type, extracted transaction codes, and plain-English interpretations.
            </div>
          </div>

          <div class="report-section">
            <div class="report-title">Key Metrics</div>
            <div class="report-status">
              <div class="report-card">
                <div class="report-stat low">24</div>
                <div class="report-stat-label">Codes Found</div>
              </div>
              <div class="report-card">
                <div class="report-stat low">100%</div>
                <div class="report-stat-label">Interpretation</div>
              </div>
              <div class="report-card">
                <div class="report-stat moderate">8.3s</div>
                <div class="report-stat-label">Processing</div>
              </div>
            </div>
          </div>

          <div class="report-footer">
            <div>${escapeHtml(location.host)}</div>
            <div>Client-ready format • Print-friendly</div>
          </div>
        </div>
      </div>
    `;
  }

  function initReportPreview() {
    const btn = $("preview-report-btn");
    const out = $("free-report-output");
    const printBtn = $("report-print");

    if (btn) {
      btn.addEventListener("click", () => {
        if (out) out.innerHTML = buildFreeReportShell();
        showPage("free-report");
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }
  }

  function init() {
    initHashRouting();
    handleLeadForm();
    initReportPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();