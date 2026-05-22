// =====================================================
// PRIME MOTORS — src/main.js
// =====================================================
import './styles/style.css'
import { fetchAvailableCars, fetchAvailableCount } from './services/inventory.js'
import { trackLead, waInquiry } from './services/leads.js'
import { cardHTML, emptyState, bindLeadTracking } from './components/cards.js'
import { initGallery, galleryMainHTML, detailCTAHTML, bindGalleryEvents, bindDetailLeads } from './components/gallery.js'
import { showToast } from './components/toast.js'
import { getWhatsAppLink } from './config.js'
import { USE_SUPABASE } from './services/supabase.js'

let cars = [], curSlide = 0, menuOpen = false

document.addEventListener('DOMContentLoaded', async () => {
  initScrollNav()
  startHeroSlideshow()
  initScrollAnimations()
  if (!USE_SUPABASE) { showError('Configure Supabase in .env to load inventory.'); return }
  try {
    [cars] = await Promise.all([fetchAvailableCars(), updateCount()])
    renderFeatured()
  } catch (e) { console.error(e); showError('Failed to load inventory.') }
  bindBannerLead()
})

async function updateCount() {
  try {
    const n = await fetchAvailableCount()
    const el = document.getElementById('heroCarCount')
    if (el) el.textContent = n
  } catch {}
}

function showError(msg) {
  ['featuredGrid','invGrid'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerHTML = emptyState(msg)
  })
}

// ── Navigation ──
function nav(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'))
  document.getElementById('page-'+page).classList.add('active')
  document.getElementById('nl-'+page)?.classList.add('active')
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (page === 'inventory') fetchAvailableCars().then(d => { cars = d; renderInventory(cars) }).catch(() => {})
  if (page === 'home') renderFeatured()
}
window.nav = nav

function toggleMenu() {
  menuOpen = !menuOpen
  document.getElementById('mobileNav')?.classList.toggle('open', menuOpen)
  document.getElementById('mobBackdrop')?.classList.toggle('on', menuOpen)
  document.getElementById('hamburger')?.classList.toggle('open', menuOpen)
  document.body.style.overflow = menuOpen ? 'hidden' : ''
}
function closeMenu() {
  menuOpen = false
  document.getElementById('mobileNav')?.classList.remove('open')
  document.getElementById('mobBackdrop')?.classList.remove('on')
  document.getElementById('hamburger')?.classList.remove('open')
  document.body.style.overflow = ''
}
window.toggleMenu = toggleMenu
window.closeMenu = closeMenu

function initScrollNav() {
  window.addEventListener('scroll', () =>
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50))
}

function startHeroSlideshow() {
  setInterval(() => setSlide((curSlide+1)%4), 5000)
}
function setSlide(n) {
  document.querySelectorAll('.hero-slide').forEach((s,i) => s.classList.toggle('active', i===n))
  document.querySelectorAll('.h-dot').forEach((d,i) => d.classList.toggle('active', i===n))
  curSlide = n
}
window.setSlide = setSlide

// ── Render ──
function renderFeatured() {
  const el = document.getElementById('featuredGrid')
  if (!el) return
  el.innerHTML = cars.length ? cars.slice(0,6).map(c => cardHTML(c)).join('') : emptyState('No cars available.')
  bindLeadTracking(el)
}

function renderInventory(list) {
  const el = document.getElementById('invGrid')
  const rc = document.getElementById('rCnt')
  if (el) { el.innerHTML = list.length ? list.map(c => cardHTML(c)).join('') : emptyState('No cars match filters.')
    bindLeadTracking(el) }
  if (rc) rc.textContent = list.length
}

function applyFilters() {
  const b = document.getElementById('fBrand').value
  const f = document.getElementById('fFuel').value
  const g = document.getElementById('fBudget').value
  let fl = cars
  if (b) fl = fl.filter(c => c.brand === b)
  if (f) fl = fl.filter(c => c.fuel  === f)
  if (g) fl = fl.filter(c => c.price < parseInt(g))
  renderInventory(fl)
}
window.applyFilters = applyFilters

// ── Detail ──
async function openDetail(id) {
  const car = cars.find(c => c.id === id)
  if (!car) { showToast('Car not found','error'); return }
  initGallery(car)
  document.getElementById('detailBody').innerHTML = `
    <div>${galleryMainHTML(car)}</div>
    <div class="detail-info">
      <div class="d-badges">
        <span class="d-badge d-badge-red">Certified Pre-Owned</span>
        <span class="d-badge d-badge-gr">${car.fuel}</span>
        <span class="d-badge d-badge-gr">${car.trans}</span>
        ${car.owner?`<span class="d-badge d-badge-gr">${car.owner}</span>`:''}
      </div>
      <h1 class="d-title">${car.brand} ${car.model}</h1>
      <p class="d-sub">${car.year} &nbsp;·&nbsp; ${car.km}</p>
      <div class="d-price">₹${car.price}L</div>
      <p class="d-pnote">All-inclusive · EMI available · No hidden charges</p>
      <table class="specs-tbl">
        <tr><td>Brand</td><td>${car.brand}</td></tr>
        <tr><td>Model</td><td>${car.model}</td></tr>
        <tr><td>Year</td><td>${car.year}</td></tr>
        <tr><td>Odometer</td><td>${car.km}</td></tr>
        <tr><td>Fuel</td><td>${car.fuel}</td></tr>
        <tr><td>Transmission</td><td>${car.trans}</td></tr>
        ${car.color?`<tr><td>Color</td><td>${car.color}</td></tr>`:''}
        ${car.owner?`<tr><td>Owner</td><td>${car.owner}</td></tr>`:''}
      </table>
      ${detailCTAHTML(car)}
    </div>`
  bindGalleryEvents()
  bindDetailLeads()
  nav('detail')
}
window.openDetail = openDetail

function bindBannerLead() {
  document.getElementById('bannerWaBtn')?.addEventListener('click', async (e) => {
    // Lead stored before redirect
    const waUrl = e.currentTarget.href || ''
    e.preventDefault()
    await waInquiry({ id:null, brand:'General', model:'Enquiry', price:0 }, waUrl)
  })
}

// ── Scroll Animations ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

// Re-run on page switch for dynamic content
function observeFadeIns(container) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) }
    })
  }, { threshold: 0.1 })
  container?.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

window.handleWhatsAppClick = function(e, id, brand, model, price) {

  // Stop card click
  e.stopPropagation()

  // 🚀 Track in background (NO await)
  try {
    fetch('/track-lead', {
      method: 'POST',
      body: JSON.stringify({
        id,
        brand,
        model,
        price,
        source: 'whatsapp_card'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    console.warn('Lead tracking failed')
  }

}