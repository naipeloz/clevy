// Outbound email via Mailgun's HTTP API (no SDK dependency — just fetch).
// Configured through env vars:
//   MAILGUN_API_KEY   – private API key
//   MAILGUN_DOMAIN    – sending domain (e.g. the sandbox domain)
//   MAILGUN_BASE_URL  – API base, defaults to https://api.mailgun.net
//   MAILGUN_FROM      – From header, defaults to no-reply@<domain>
// If the key/domain aren't set, we fall back to logging so local dev still works.

type Email = {
  to: string;
  subject: string;
  text: string;
};

async function deliver(email: Email): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    console.log(
      `[mailer] (Mailgun not configured) email to ${email.to}\n` +
        `Subject: ${email.subject}\n${email.text}`
    );
    return;
  }

  const baseUrl = process.env.MAILGUN_BASE_URL ?? "https://api.mailgun.net";
  const from = process.env.MAILGUN_FROM ?? `Clevy <no-reply@${domain}>`;

  const form = new URLSearchParams({
    from,
    to: email.to,
    subject: email.subject,
    text: email.text,
  });

  const res = await fetch(`${baseUrl}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mailgun send failed (${res.status}): ${detail}`);
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  await deliver({
    to: params.to,
    subject: "Restablecé tu contraseña · Clevy",
    text:
      `Hola ${params.name},\n\n` +
      `Recibimos un pedido para restablecer la contraseña de tu cuenta Clevy. ` +
      `Abrí este enlace para elegir una nueva contraseña (vence en 1 hora):\n\n` +
      `${params.resetUrl}\n\n` +
      `Si no lo pediste, podés ignorar este mensaje.`,
  });
}
