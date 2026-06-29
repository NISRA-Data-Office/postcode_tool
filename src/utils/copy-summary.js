export function copySummary(data) {
  const button = document.getElementById("copy-summary");
  const summary = document.getElementById("summary") || document.getElementById("deprivation-summary");

  button.setAttribute(
    "aria-label",
    `Copy deprivation summary for ${data.name} to clipboard`
  );

  if (!button || !summary) return;

  button.addEventListener("click", () => {
    const text = summary.innerText;

    navigator.clipboard.writeText(text).then(() => {
      const text_copied = document.getElementById("text-copied");
      text_copied.classList.remove("d-none");

      setTimeout(() => {
        text_copied.classList.add("d-none");
      }, 2000);
    });
  });
}