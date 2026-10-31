// Donations by UPI. Fill these in to switch the "सहयोग करें" button on in the published site.
//
//   upiId   — your UPI ID, e.g. 'yourname@okaxis'
//   payee   — the name UPI apps show to the donor
//   qr      — your UPI QR code image: put the file in public/donate/ and give its path, e.g. '/donate/upi-qr.png'
//   amounts — the small suggested amounts (₹), shown as one-tap choices
//
// Until upiId or qr is set, the button only appears during `npm run dev`, with placeholders.
export const DONATE = {
  upiId: '',
  payee: '',
  qr: '',
  amounts: [11, 21, 51, 101],
}

export const donateReady = Boolean(DONATE.upiId || DONATE.qr)

/** The QR image's URL, also when the site is served from a sub-folder (like GitHub Pages). */
export const qrSrc = DONATE.qr.startsWith('/') ? import.meta.env.BASE_URL + DONATE.qr.slice(1) : DONATE.qr

/** A UPI payment link; on phones it opens GPay / PhonePe / Paytm with the amount filled in. */
export function upiLink(amount) {
  const params = new URLSearchParams({ pa: DONATE.upiId, pn: DONATE.payee || 'Chhath Ghat', cu: 'INR', tn: 'छठ घाट सहयोग' })
  if (amount) params.set('am', String(amount))
  return `upi://pay?${params.toString()}`
}
