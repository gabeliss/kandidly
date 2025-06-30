import express from 'express';
import resend from 'resend';

const router = express.Router();
resend.api_key = "re_La1u5jsm_PNHCHVULz6Y6qTRwLvPuccrY";

router.post('/', async (req, res) => {
  const { to, from, subject, html } = req.body;
  if (!to || !from || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await resend.Emails.send({ from, to, subject, html });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 