// Vercel serverless function: adds an email to a Resend Audience.
// Requires env vars RESEND_API_KEY and RESEND_AUDIENCE_ID (set in Vercel project settings).
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email } = req.body || {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Valid email required' });
    return;
  }

  const { RESEND_API_KEY, RESEND_AUDIENCE_ID } = process.env;
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID');
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const resendRes = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    // Resend returns an error if the contact already exists — treat that as success.
    if (!resendRes.ok && resendRes.status !== 409) {
      const detail = await resendRes.text();
      console.error('Resend error', resendRes.status, detail);
      res.status(502).json({ error: 'Failed to subscribe' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe error', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};
