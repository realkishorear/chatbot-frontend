(function () {
  if (window.__chatbotLoaded) return;
  window.__chatbotLoaded = true;

  // Create toggle button
  const button = document.createElement('button');
  button.innerText = '💬 Chat';
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '99998',
    border: 'none',
    background: '#0B93F6',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'background 0.3s',
  });

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'http://192.168.132.96:3001/chatbot-widget'; // Update this to your actual chatbot URL
  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '400px',
    height: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    border: 'none',
    borderRadius: '12px',
    zIndex: '99999',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'none',
    transition: 'all 0.3s ease-in-out',
    pointerEvents: 'none', // Initially disable pointer events
  });

  // Update responsive styles
  const updateResponsiveStyles = () => {
    const isMobile = window.innerWidth < 600;
    if (isMobile) {
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.borderRadius = '12px';
    } else {
      iframe.style.width = '400px';
      iframe.style.height = '600px';
      iframe.style.bottom = '80px';
      iframe.style.right = '20px';
      iframe.style.borderRadius = '12px';
    }
  };

  window.addEventListener('resize', updateResponsiveStyles);
  updateResponsiveStyles();

  // Toggle behavior
  button.onclick = () => {
    const isVisible = iframe.style.display === 'block';
    if (isVisible) {
      iframe.style.display = 'none';
      iframe.style.pointerEvents = 'none';
      document.body.style.overflow = ''; // Restore scroll
    } else {
      iframe.style.display = 'block';
      iframe.style.pointerEvents = 'auto';
      document.body.style.overflow = 'hidden'; // Disable background scroll
    }
  };

  const org_id = window.__org_id;
  iframe.src = `http://192.168.228.96:3000/chatbot-widget?org_id=${encodeURIComponent(org_id)}`

  // Append to DOM
  document.body.appendChild(button);
  document.body.appendChild(iframe);
})();
