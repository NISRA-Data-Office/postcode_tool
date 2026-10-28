export function copySummary(data) {
  const button = document.getElementById("copy-summary");
  const summary = document.getElementById("deprivation-summary");
  const summary_heading = document.getElementById("summary-heading");

  button.setAttribute(
    "aria-label",
    `Copy deprivation summary for ${data.name} to clipboard`
  );

  if (!button || !summary) return;

  button.addEventListener("click", async () => {
  const text = `${summary_heading.innerText}\n\n${summary.innerText}\n\nSource: NISRA`;

  if (!navigator.clipboard) {
    console.error("Clipboard API not available.");
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }

    const textCopied = document.getElementById("text-copied");
    textCopied.classList.remove("d-none");

    setTimeout(() => {
      textCopied.classList.add("d-none");
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
});
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}