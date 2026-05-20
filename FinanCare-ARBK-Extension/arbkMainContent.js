// This runs in the MAIN world on the ARBK website (has access to page's localStorage)
let isEnabled = false;
let originalText = "";

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_ARBK_BRIDGE_CONFIG") {
    isEnabled = event.data.enabled;
    if (isEnabled) {
      createSendButton();
      setInterval(createSendButton, 2000);
    }
  }
  
  if (event.data && event.data.type === "ARBK_SEND_STATUS") {
    const status = event.data.status;
    const btn = document.getElementById("fc-arbk-btn");
    if (!btn) return;
    
    btn.style.opacity = "1";
    if (status === "sending") {
      btn.innerHTML = `<svg style="width:18px;height:18px;margin-right:8px;animation:spin 1s linear infinite" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Duke dërguar...`;
      btn.style.opacity = "0.9";
    } else if (status === "success") {
      btn.innerHTML = "✓ U dërgua me sukses!";
      btn.style.backgroundColor = "#047857";
      btn.style.backgroundImage = "none";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = "#10b981";
        btn.style.backgroundImage = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      }, 3000);
    } else if (status === "error") {
      btn.innerHTML = originalText;
      alert(event.data.message || "Gabim gjatë dërgimit.");
    }
  }
});

function createSendButton() {
  if (!isEnabled) return;
  if (document.getElementById("fc-arbk-btn")) return;
  
  const btn = document.createElement("button");
  btn.id = "fc-arbk-btn";
  btn.innerHTML = `<svg style="width:18px;height:18px;margin-right:8px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Dërgo në FinanCare`;
  originalText = btn.innerHTML;
  
  btn.style.position = "fixed";
  btn.style.bottom = "30px";
  btn.style.right = "30px";
  btn.style.zIndex = "999999";
  btn.style.padding = "14px 24px";
  btn.style.backgroundColor = "#10b981";
  btn.style.backgroundImage = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "50px";
  btn.style.fontWeight = "600";
  btn.style.boxShadow = "0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.2)";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "16px";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
  
  btn.onmouseover = () => {
    btn.style.transform = "translateY(-3px)";
    btn.style.boxShadow = "0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.2)";
  };
  btn.onmouseout = () => {
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = "0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.2)";
  };
  
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
  
  btn.onclick = () => {
    // We are in the main world! We have actual access to webpage's localStorage
    const data = localStorage.getItem("state");
    if (!data) {
      alert("Ju lutem bëni një kërkim në ARBK së pari!");
      return;
    }
    
    // Post event back to isolated world content script to handle messaging
    window.postMessage({ type: "FROM_PAGE_ARBK_STATE", payload: data }, "*");
  };
  
  document.body.appendChild(btn);
}
