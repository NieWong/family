'use strict';

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const acceptedAt = (req.body && req.body.acceptedAt) || new Date().toISOString();
    const userAgent = (req.body && req.body.userAgent) || (req.headers['user-agent'] || 'unknown');
    const referer = req.headers['referer'] || 'unknown';

    const getCfg = (key) => {
        const val = process.env[key];
        if (val === undefined || val === '') return "";
        return key === 'SMTP_PORT' ? Number(val) : (key === 'SMTP_SECURE' ? String(val).toLowerCase() === 'true' : val);
    };

    const transporter = nodemailer.createTransport({
        host: getCfg('SMTP_HOST'),
        port: getCfg('SMTP_PORT') || 587,
        secure: getCfg('SMTP_SECURE'),
        auth: { user: getCfg('SMTP_USER'), pass: getCfg('SMTP_PASS') },
        logger: true
    });

    const from = (process.env.MAIL_FROM && process.env.MAIL_FROM !== '') ? process.env.MAIL_FROM : getCfg('SMTP_USER');
    const to = (process.env.MAIL_TO && process.env.MAIL_TO !== '') ? process.env.MAIL_TO : getCfg('SMTP_USER');
    const subject = (process.env.SUBJECT && process.env.SUBJECT !== '') ? process.env.SUBJECT : 'Someone said YES! 💌';

	const text = `They said YES!\nTime: ${acceptedAt}\nUser-Agent: ${userAgent}\nFrom: ${referer}`;

	const proto = (req.headers['x-forwarded-proto'] || 'https');
	const host = req.headers['x-forwarded-host'] || req.headers.host || '';
	const origin = host ? `${proto}://${host}` : '';
	const yesUrl = origin ? `${origin}/yes_page.html` : '';

	const imagePath = process.env.MAIL_IMAGE_PATH || 'IMG_0724.JPG';
	const fallbackGif = 'https://media1.giphy.com/media/VM1fcpu2bKs1e2Kdbj/giphy.gif';
	const photoSrc = origin ? `${origin}/${encodeURIComponent(imagePath)}` : fallbackGif;

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>They said YES 💌</title>
  <style>
    @media (prefers-color-scheme: dark) { .card { box-shadow: none !important; } }
  </style>
</head>
<body style="margin:0;background:#ffeaf1;font-family:Segoe UI,Arial,sans-serif;color:#402e32;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">They said YES! 💖</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffeaf1;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" class="card" style="background:#ffffff;border-radius:18px;box-shadow:0 12px 30px rgba(0,0,0,0.07);overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px 24px 8px 24px;background:linear-gradient(135deg,#ffd6e6,#fff1f6);">
              <h1 style="margin:0;font-size:26px;color:#d32f2f;">They said <span style="color:#c71c56">YES</span>! 💘</h1>
              <p style="margin:8px 0 0 0;color:#7b3b4a;font-weight:600;">A little heart just grew three sizes.</p>
            </td>
          </tr>
          <tr>
			<td align="center" style="padding:18px 24px 0;">
				<img src="${photoSrc}" width="200" height="auto" alt="Our photo" style="border-radius:12px;display:block;" />
			</td>
          </tr>
          <tr>
            <td style="padding:18px 24px 0;">
              <p style="margin:0 0 10px 0;line-height:1.6;">
                <strong>Time</strong>: ${escapeHtml(String(acceptedAt))}<br/>
                <strong>User‑Agent</strong>: <code style="color:#b05469;">${escapeHtml(userAgent)}</code><br/>
                <strong>From</strong>: <code style="color:#b05469;">${escapeHtml(referer)}</code>
              </p>
            </td>
          </tr>
          ${yesUrl ? `
          <tr>
            <td align="center" style="padding:12px 24px 24px;">
              <a href="${yesUrl}" style="display:inline-block;background:#ff7aa2;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Open the celebration 🎉</a>
            </td>
          </tr>` : ''}
          <tr>
            <td align="center" style="padding:6px 24px 24px;color:#a76b7a;font-size:13px;">
              Sent with ❤️ by your Valentine page
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        await transporter.verify();
        await transporter.sendMail({ from, to, subject, text, html });
        return res.status(200).json({ ok: true });
    } catch (error) {
        return res.status(500).json({ ok: false, error: String((error && error.message) || error) });
    }
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


