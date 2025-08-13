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

    const INLINE = {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        SMTP_USER: 'st.sukhe@gmail.com',
        SMTP_PASS: "udljlnskvhxcyndm",
        MAIL_FROM: 'st.sukhe@gmail.com',
        MAIL_TO: 'ab.sukhee@gmail.com',
        SUBJECT: 'YEAHHHHH'
    };

    const getCfg = (key) => {
        const val = process.env[key];
        if (val === undefined || val === '') return INLINE[key];
        return key === 'SMTP_PORT' ? Number(val) : (key === 'SMTP_SECURE' ? String(val).toLowerCase() === 'true' : val);
    };

    const transporter = nodemailer.createTransport({
        host: getCfg('SMTP_HOST'),
        port: getCfg('SMTP_PORT') || 587,
        secure: getCfg('SMTP_SECURE'),
        auth: { user: getCfg('SMTP_USER'), pass: getCfg('SMTP_PASS') },
        logger: true
    });

    const from = (process.env.MAIL_FROM && process.env.MAIL_FROM !== '') ? process.env.MAIL_FROM : (INLINE.MAIL_FROM || getCfg('SMTP_USER'));
    const to = (process.env.MAIL_TO && process.env.MAIL_TO !== '') ? process.env.MAIL_TO : (INLINE.MAIL_TO || getCfg('SMTP_USER'));
    const subject = (process.env.SUBJECT && process.env.SUBJECT !== '') ? process.env.SUBJECT : INLINE.SUBJECT;

    const text = `They said YES!\nTime: ${acceptedAt}\nUser-Agent: ${userAgent}\nFrom: ${referer}`;
    const html = `
<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;color:#333">
  <h2 style="margin:0 0 8px">They said <span style="color:#d32f2f">YES</span>! 💖</h2>
  <p style="margin:6px 0">Time: <strong>${acceptedAt}</strong></p>
  <p style="margin:6px 0">User-Agent: <code>${escapeHtml(userAgent)}</code></p>
  <p style="margin:6px 0">From: <code>${escapeHtml(referer)}</code></p>
</div>`;

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


