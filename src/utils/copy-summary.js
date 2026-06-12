export function copySummary() {
  const button = document.getElementById("copy-summary");
  const summary = document.getElementById("summary") || document.getElementById("deprivation-summary");

  if (!button || !summary) return;

  button.addEventListener("click", () => {
    const text = summary.innerText;

    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = "Summary copied";

      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    });
  });
}