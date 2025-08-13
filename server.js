'use strict';

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.get('/health', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: String(error && error.message || error) });
    }
});

app.post('/send-yes', async (req, res) => {
    const acceptedAt = req.body && req.body.acceptedAt || new Date().toISOString();
    const userAgent = req.body && req.body.userAgent || req.get('user-agent') || 'unknown';
    const referer = req.get('referer') || 'unknown';

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const to = process.env.MAIL_TO || process.env.SMTP_USER;
    const subject = process.env.SUBJECT || 'my forever family';

    const text = `They said YES!
Time: ${acceptedAt}
User-Agent: ${userAgent}
From: ${referer}`;

    const html = `
<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;color:#333">
  <h2 style="margin:0 0 8px">They said <span style="color:#d32f2f">YES</span>! 💖</h2>
  <p style="margin:6px 0">Time: <strong>${acceptedAt}</strong></p>
  <p style="margin:6px 0">User-Agent: <code>${escapeHtml(userAgent)}</code></p>
  <p style="margin:6px 0">From: <code>${escapeHtml(referer)}</code></p>
</div>`;

    try {
        await transporter.sendMail({ from, to, subject, text, html });
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: String(error && error.message || error) });
    }
});

app.listen(port, () => {
    console.log(`Mail server listening on http://localhost:${port}`);
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


