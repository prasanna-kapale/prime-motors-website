// =====================================================
// PRIME MOTORS — src/components/toast.js
// =====================================================
let _timer = null

export function showToast(msg, type = 'info') {
  let toast = document.getElementById('pmToast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'pmToast'
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      background: '#141414', border: '1px solid #2E2E2E',
      borderLeft: '3px solid #CC1E1E', color: '#fff',
      fontFamily: "'Outfit', sans-serif", fontSize: '.82rem',
      padding: '14px 20px', maxWidth: '340px', lineHeight: '1.4',
      transform: 'translateY(80px)', opacity: '0',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    })
    document.body.appendChild(toast)
  }

  const colors = { success: '#22C55E', error: '#EF4444', info: '#CC1E1E', warn: '#F59E0B' }
  toast.style.borderLeftColor = colors[type] || colors.info
  toast.textContent = msg

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)'
    toast.style.opacity   = '1'
  })
  clearTimeout(_timer)
  _timer = setTimeout(() => {
    toast.style.transform = 'translateY(80px)'
    toast.style.opacity   = '0'
  }, 3800)
}

export function showLoading(msg = 'Loading…') {
  showToast('⏳ ' + msg, 'info')
}
