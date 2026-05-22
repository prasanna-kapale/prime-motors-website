// =====================================================
// PRIME MOTORS — src/config.js
// =====================================================
export const CONFIG = {
  OWNER_PASSWORD:   'Husayn@9666',
  MANAGER_PASSWORD: 'Manager@9666',
  WA_NUMBER:        '919700330087',
  PHONE_NUMBER:     '+919700330087',
  PHONE_DISPLAY:    '+91 97666 19309',
  BUSINESS_NAME:    'Prime Motors',
  BUSINESS_TAGLINE: 'Deals on Wheels',
  BUSINESS_ADDRESS: 'Beside CBC Mall, Nagpur Road, Chandrapur, Maharashtra, 442401',
  BUSINESS_EMAIL:   'primemotor666@gmail.com',
  LOGO_PATH:        '/logo-white.png',
  FACEBOOK_URL:     'https://www.facebook.com/people/prime_motors_chandrapur/100064105029449/?mibextid=wwXIfr',
  INSTAGRAM_URL:    'https://www.instagram.com/prime_motors_chandrapur',
}

export function getWhatsAppLink(message) {
  return `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`
}
export function getCarWhatsAppLink(car) {
  const msg = `Hi Prime Motors! I'm interested in the ${car.year} ${car.brand} ${car.model} (₹${car.price}L). Can you share more details?`
  return getWhatsAppLink(msg)
}
export function getCallLink() {
  return `tel:${CONFIG.PHONE_NUMBER}`
}
