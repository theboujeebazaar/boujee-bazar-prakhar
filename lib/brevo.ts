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
  image?: string
  image_url?: string
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

export function getAbsoluteImageUrl(src?: string | null): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theboujeebazaar.in'
  if (!src) return `${siteUrl}/assets/img/pr_1.jpeg`
  const trimmed = src.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const cleanSrc = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${siteUrl}${cleanSrc}`
}

export function orderConfirmationEmailHtml(order: OrderEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theboujeebazaar.in'
  const trackLink = `${siteUrl}/track-order?order=${encodeURIComponent(order.id)}`
  const items = order.items || []
  const itemCount = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)

  const itemRows = items
    .map((item, idx) => {
      const qty = Number(item.quantity) || 1
      const lineTotal = (Number(item.price) || 0) * qty
      const imgUrl = getAbsoluteImageUrl(item.image_url || item.image)
      const isLast = idx === items.length - 1

      return `
        <tr>
          <td colspan="3" style="padding: 0; border-bottom: ${isLast ? '0' : `1px solid ${BRAND.border}`};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 18px 0; width: 68px; vertical-align: top;">
                  <img src="${imgUrl}" alt="${item.name || 'Product Image'}" width="60" height="76" style="width: 60px; height: 76px; object-fit: cover; border-radius: 12px; border: 1px solid ${BRAND.border}; display: block;" />
                </td>
                <td style="padding: 18px 0 18px 16px; vertical-align: top; text-align: left;">
                  <div style="font-size: 14px; font-weight: 700; color: ${BRAND.ink}; line-height: 1.4; font-family: Georgia, 'Times New Roman', serif;">
                    ${item.name || 'Item'}
                  </div>
                  ${item.variant_name ? `
                    <div style="margin-top: 7px;">
                      <span style="font-size: 9px; font-weight: 700; color: ${BRAND.goldDark}; text-transform: uppercase; background-color: ${BRAND.cream}; border: 1px solid ${BRAND.gold}; padding: 3px 8px; border-radius: 20px; display: inline-block; letter-spacing: 0.5px;">
                        ${item.variant_name}
                      </span>
                    </div>
                  ` : ''}
                  <div style="color: ${BRAND.ink}; opacity: 0.45; font-size: 11px; margin-top: 7px; font-weight: 600; letter-spacing: 0.3px;">QTY ${qty}</div>
                </td>
                <td style="padding: 18px 0; vertical-align: top; text-align: right; white-space: nowrap; font-size: 14px; font-weight: 700; color: ${BRAND.ink};">
                  ${formatINR(lineTotal)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join('')

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding: 7px 0; font-size: ${bold ? '15px' : '12.5px'}; color: ${BRAND.ink}; font-weight: ${bold ? '700' : '500'}; opacity: ${bold ? '1' : '0.55'}; text-align: left; letter-spacing: ${bold ? '0.2px' : '0'};">${label}</td>
      <td style="padding: 7px 0; font-size: ${bold ? '15px' : '12.5px'}; color: ${bold ? BRAND.goldDark : BRAND.ink}; font-weight: ${bold ? '800' : '600'}; text-align: right;">${value}</td>
    </tr>
  `

  const discountRow = order.discount && order.discount > 0 ? summaryRow('Discount', `-${formatINR(order.discount)}`) : ''

  return `
    <div style="background-color: #F3EFE8; padding: 48px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        Your order #${order.id} is confirmed — ${formatINR(order.total)} paid. Thank you for shopping with The Boujee Bazaar.
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; margin: 0 auto; border-collapse: separate;">

        <!-- Gold Header Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldDark} 100%); border-radius: 24px 24px 0 0; padding: 30px 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 2px; margin: 0; font-family: Georgia, 'Times New Roman', serif; text-transform: lowercase;">
              the<span style="opacity: 0.75;">boujee</span> bazaar<span style="opacity: 0.75;">.</span>
            </h1>
          </td>
        </tr>

        <!-- Main Card -->
        <tr>
          <td style="background-color: #ffffff; padding: 0 32px 36px; border-radius: 0 0 24px 24px; box-shadow: 0 12px 32px rgba(23, 20, 18, 0.08); color: ${BRAND.ink}; text-align: center;">

            <!-- Success Hero -->
            <div style="padding: 34px 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 18px;">
                <tr>
                  <td style="width: 56px; height: 56px; border-radius: 50%; background-color: ${BRAND.cream}; border: 1.5px solid ${BRAND.gold}; text-align: center; vertical-align: middle; font-size: 24px; color: ${BRAND.goldDark}; font-weight: bold;">
                    &#10003;
                  </td>
                </tr>
              </table>
              <h2 style="color: ${BRAND.ink}; font-size: 23px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.3px; font-family: Georgia, 'Times New Roman', serif;">Order Confirmed!</h2>
              <p style="color: ${BRAND.ink}; opacity: 0.6; font-size: 13.5px; margin: 0 0 14px; line-height: 1.6;">
                Thank you${order.customer_name ? `, ${order.customer_name}` : ''}, for shopping with The Boujee Bazaar.<br />Your ${itemCount} item${itemCount === 1 ? '' : 's'} ${itemCount === 1 ? 'is' : 'are'} being prepared with care.
              </p>
              <span style="display: inline-block; color: ${BRAND.goldDark}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.8px; background-color: ${BRAND.cream}; border: 1px solid ${BRAND.border}; padding: 6px 16px; border-radius: 20px;">
                ORDER #${order.id}
              </span>
            </div>

            <!-- Product List -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border-top: 1px solid ${BRAND.border}; margin-bottom: 4px;">
              ${itemRows}
            </table>

            <!-- Charges Summary -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 20px 0 26px; border-top: 1px solid ${BRAND.border}; padding-top: 4px;">
              <tr><td colspan="2" style="height: 10px;"></td></tr>
              ${order.subtotal != null ? summaryRow('Subtotal', formatINR(order.subtotal)) : ''}
              ${order.shipping_fee != null ? summaryRow('Shipping', order.shipping_fee > 0 ? formatINR(order.shipping_fee) : 'Free') : ''}
              ${discountRow}
              <tr><td colspan="2" style="padding-top: 10px; border-top: 1px dashed ${BRAND.border};"></td></tr>
              ${summaryRow('Total Paid', formatINR(order.total), true)}
            </table>

            <!-- Delivery Address -->
            ${order.shipping_address ? `
              <div style="background-color: ${BRAND.cream}; border: 1px solid ${BRAND.border}; border-radius: 16px; padding: 18px 20px; text-align: left; margin-bottom: 20px;">
                <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${BRAND.goldDark};">&#128205; Shipping Address</p>
                <p style="margin: 0; font-size: 12.5px; color: ${BRAND.ink}; opacity: 0.75; line-height: 1.6; font-weight: 500;">${order.shipping_address}</p>
              </div>
            ` : ''}

            <p style="margin: 0 0 28px; font-size: 12.5px; color: ${BRAND.ink}; opacity: 0.55; font-weight: 500;">
              Payment Method: <strong style="opacity: 1; color: ${BRAND.ink};">${order.payment_method || 'COD'}</strong>
            </p>

            <!-- CTA -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="border-radius: 50px; background: linear-gradient(135deg, ${BRAND.ink} 0%, #2b2622 100%); box-shadow: 0 6px 16px rgba(23, 20, 18, 0.18);">
                  <a href="${trackLink}" style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #ffffff; padding: 16px 40px; text-decoration: none;">
                    Track My Order
                  </a>
                </td>
              </tr>
            </table>

            <hr style="border: 0; border-top: 1px solid ${BRAND.border}; margin: 32px 0 18px;" />
            <p style="color: ${BRAND.ink}; opacity: 0.4; font-size: 11px; margin: 0 0 4px; font-style: italic; font-family: Georgia, serif;">With love, The Boujee Bazaar</p>
            <p style="color: ${BRAND.goldDark}; opacity: 0.75; font-size: 10px; margin: 0; font-weight: 500;">&copy; ${new Date().getFullYear()} The Boujee Bazaar. All rights reserved.</p>
          </td>
        </tr>
      </table>
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
