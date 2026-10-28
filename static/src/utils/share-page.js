export function sharePage() {
  const title = "Share URL";
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  const input = document.createElement("input");
  document.body.appendChild(input);

  input.value = text;
  input.select();

  document.execCommand("copy");
  document.body.removeChild(input);

  alert("URL copied to clipboard");
}

window.sharePage = sharePage;