const BRAND = {
  ink: '#171412',
  cream: '#FBF7F0',
  gold: '#c5a880',
  goldDark: '#9c7f5c',
  border: '#e6ded0',
}

export async function sendBrevoEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ success?: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@theboujeebazaar.in'
  const senderName = process.env.BREVO_SENDER_NAME || 'The Boujee Bazaar'

  if (!apiKey) {
    console.log(`[DEV MODE EMAIL] To: ${to}, Subject: ${subject}\n${html}`)
    return { success: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Brevo API Error:', errText)
      return { error: 'Failed to send email. Please try again.' }
    }

    return { success: true }
  } catch (e: any) {
    console.error('Brevo send error:', e)
    return { error: 'Failed to send email: ' + e.message }
  }
}

function emailShell(heading: string, bodyHtml: string) {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid ${BRAND.border}; border-radius: 24px; background-color: ${BRAND.cream}; color: ${BRAND.ink}; text-align: center;">
      <h1 style="color: ${BRAND.ink}; font-size: 20px; font-weight: 700; letter-spacing: 1px; margin: 0 0 24px; font-family: Georgia, serif;">
        the<span style="color: ${BRAND.gold};">boujee</span> bazaar<span style="color: ${BRAND.gold};">.</span>
      </h1>
      <hr style="border: 0; border-top: 1px solid ${BRAND.border}; margin: 0 0 24px;" />
      <h2 style="color: ${BRAND.ink}; font-size: 19px; font-weight: 600; margin: 0 0 8px;">${heading}</h2>
      ${bodyHtml}
      <hr style="border: 0; border-top: 1px solid ${BRAND.border}; margin: 28px 0 20px;" />
      <p style="color: ${BRAND.goldDark}; opacity: 0.8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} The Boujee Bazaar. All rights reserved.</p>
    </div>
  `
}

export function resetPasswordEmailHtml(link: string) {
  return emailShell(
    'Reset your password',
    `
      <p style="color: ${BRAND.ink}; opacity: 0.75; font-size: 14px; line-height: 1.6; margin: 0 0 28px; max-width: 360px; margin-left: auto; margin-right: auto;">
        We received a request to reset your The Boujee Bazaar account password. Click the button below to choose a new one.
      </p>
      <a href="${link}" style="display: inline-block; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fff; padding: 14px 32px; border-radius: 999px; background-color: ${BRAND.ink}; text-decoration: none;">
        Reset Password
      </a>
      <p style="color: ${BRAND.ink}; opacity: 0.5; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
        This link is valid for 30 minutes.<br />If you did not request this, please ignore this email — your password will not change.
      </p>
    `
  )
}

export function signupOtpEmailHtml(otp: string) {
  return emailShell(
    'Verify your email',
    `
      <p style="color: ${BRAND.ink}; opacity: 0.75; font-size: 14px; line-height: 1.6; margin: 0 0 28px; max-width: 360px; margin-left: auto; margin-right: auto;">
        Enter the 6-digit code below to confirm your email and finish creating your The Boujee Bazaar account.
      </p>
      <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${BRAND.ink}; padding: 14px 28px; border: 1.5px solid ${BRAND.gold}; border-radius: 16px; background-color: #fff;">
        ${otp}
      </div>
      <p style="color: ${BRAND.ink}; opacity: 0.5; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
        This code is valid for 10 minutes.<br />If you did not request this, please ignore this email.
      </p>
    `
  )
}

export function passwordChangedEmailHtml() {
  return emailShell(
    'Password updated',
    `
      <p style="color: ${BRAND.ink}; opacity: 0.75; font-size: 14px; line-height: 1.6; margin: 0; max-width: 360px; margin-left: auto; margin-right: auto;">
        Your The Boujee Bazaar account password was just changed. If this wasn't you, please contact us immediately.
      </p>
    `
  )
}

type OrderEmailItem = {
  name?: string
  quantity?: number
  price?: number
  variant_name?: string
}

export type OrderEmailData = {
  id: string
  customer_name?: string | null
  items?: OrderEmailItem[] | null
  subtotal?: number | null
  shipping_fee?: number | null
  discount?: number | null
  total: number
  payment_method?: string | null
  shipping_address?: string | null
}

const formatINR = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

export function orderConfirmationEmailHtml(order: OrderEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theboujeebazaar.in'
  const trackLink = `${siteUrl}/track-order?order=${encodeURIComponent(order.id)}`
  const items = order.items || []

  const itemRows = items
    .map((item) => {
      const qty = Number(item.quantity) || 1
      const lineTotal = (Number(item.price) || 0) * qty
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid ${BRAND.border}; font-size: 13px; color: ${BRAND.ink};">
            ${item.name || 'Item'}${item.variant_name ? ` <span style="color:${BRAND.goldDark}; opacity:0.8;">(${item.variant_name})</span>` : ''}
            <div style="color: ${BRAND.ink}; opacity: 0.5; font-size: 11px; margin-top: 2px;">Qty: ${qty}</div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid ${BRAND.border}; font-size: 13px; color: ${BRAND.ink}; text-align: right; white-space: nowrap;">
            ${formatINR(lineTotal)}
          </td>
        </tr>
      `
    })
    .join('')

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding: 4px 0; font-size: ${bold ? '15px' : '13px'}; color: ${BRAND.ink}; font-weight: ${bold ? '700' : '400'}; opacity: ${bold ? '1' : '0.7'};">${label}</td>
      <td style="padding: 4px 0; font-size: ${bold ? '15px' : '13px'}; color: ${BRAND.ink}; font-weight: ${bold ? '700' : '400'}; text-align: right;">${value}</td>
    </tr>
  `

  const discountRow = order.discount && order.discount > 0 ? summaryRow('Discount', `-${formatINR(order.discount)}`) : ''

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid ${BRAND.border}; border-radius: 24px; background-color: ${BRAND.cream}; color: ${BRAND.ink};">
      <h1 style="color: ${BRAND.ink}; font-size: 20px; font-weight: 700; letter-spacing: 1px; margin: 0 0 24px; font-family: Georgia, serif; text-align: center;">
        the<span style="color: ${BRAND.gold};">boujee</span> bazaar<span style="color: ${BRAND.gold};">.</span>
      </h1>
      <hr style="border: 0; border-top: 1px solid ${BRAND.border}; margin: 0 0 24px;" />

      <h2 style="color: ${BRAND.ink}; font-size: 20px; font-weight: 700; margin: 0 0 6px; text-align: center;">Order Confirmed!</h2>
      <p style="color: ${BRAND.ink}; opacity: 0.7; font-size: 13px; margin: 0 0 4px; text-align: center;">
        Thank you${order.customer_name ? `, ${order.customer_name}` : ''}, for shopping with The Boujee Bazaar.
      </p>
      <p style="color: ${BRAND.goldDark}; font-size: 13px; font-weight: 700; margin: 0 0 28px; text-align: center;">
        Order #${order.id}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
        ${itemRows}
      </table>

      <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
        ${order.subtotal != null ? summaryRow('Subtotal', formatINR(order.subtotal)) : ''}
        ${order.shipping_fee != null ? summaryRow('Shipping', order.shipping_fee > 0 ? formatINR(order.shipping_fee) : 'Free') : ''}
        ${discountRow}
        ${summaryRow('Total Paid', formatINR(order.total), true)}
      </table>

      ${order.shipping_address ? `
        <div style="background-color: #fff; border: 1px solid ${BRAND.border}; border-radius: 14px; padding: 14px 16px; margin: 0 0 24px;">
          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: ${BRAND.goldDark};">Shipping to</p>
          <p style="margin: 0; font-size: 13px; color: ${BRAND.ink}; opacity: 0.8; line-height: 1.5;">${order.shipping_address}</p>
        </div>
      ` : ''}

      <p style="margin: 0 0 20px; font-size: 13px; color: ${BRAND.ink}; opacity: 0.7; text-align: center;">
        Payment Method: <strong style="opacity: 1;">${order.payment_method || '—'}</strong>
      </p>

      <div style="text-align: center;">
        <a href="${trackLink}" style="display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fff; padding: 14px 32px; border-radius: 999px; background-color: ${BRAND.ink}; text-decoration: none;">
          Track My Order
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid ${BRAND.border}; margin: 28px 0 20px;" />
      <p style="color: ${BRAND.goldDark}; opacity: 0.8; font-size: 11px; margin: 0; text-align: center;">&copy; ${new Date().getFullYear()} The Boujee Bazaar. All rights reserved.</p>
    </div>
  `
}

export async function sendOrderConfirmationEmail(
  order: OrderEmailData & { customer_email?: string | null }
) {
  if (!order.customer_email) return { error: 'No customer email on order' }

  return sendBrevoEmail({
    to: order.customer_email,
    subject: `Order Confirmed! #${order.id} — The Boujee Bazaar`,
    html: orderConfirmationEmailHtml(order),
  })
}
