import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const from = process.env.EMAIL_FROM ?? "Furikai <naoresponda@furikai.com.br>";

/**
 * Envio de e-mail transacional. Se RESEND_API_KEY não estiver configurada
 * (ambiente de desenvolvimento sem provedor de e-mail ainda), o link é
 * apenas impresso no console para que o fluxo continue testável.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`\n[email] (modo dev — sem RESEND_API_KEY) Para: ${params.to}`);
    console.log(`[email] Assunto: ${params.subject}`);
    console.log(`[email] ${params.html.replace(/<[^>]+>/g, " ")}\n`);
    return { simulated: true };
  }

  return resend.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
}

export function verificationEmailHtml(name: string, link: string) {
  return `
    <div style="font-family: sans-serif; background:#0a0a0b; color:#f2f1ee; padding:32px;">
      <h1 style="letter-spacing:2px;">FURIKAI</h1>
      <p>Olá, ${name}. Confirme seu e-mail para ativar sua conta:</p>
      <a href="${link}" style="display:inline-block;background:#9c1119;color:#fff;padding:12px 24px;text-decoration:none;margin-top:12px;">Confirmar e-mail</a>
      <p style="color:#6b6b6f;font-size:12px;margin-top:24px;">Se você não criou esta conta, ignore este e-mail.</p>
    </div>`;
}

export function resetPasswordEmailHtml(name: string, link: string) {
  return `
    <div style="font-family: sans-serif; background:#0a0a0b; color:#f2f1ee; padding:32px;">
      <h1 style="letter-spacing:2px;">FURIKAI</h1>
      <p>Olá, ${name}. Recebemos um pedido para redefinir sua senha.</p>
      <a href="${link}" style="display:inline-block;background:#9c1119;color:#fff;padding:12px 24px;text-decoration:none;margin-top:12px;">Redefinir senha</a>
      <p style="color:#6b6b6f;font-size:12px;margin-top:24px;">Esse link expira em 1 hora. Se você não pediu isso, ignore este e-mail.</p>
    </div>`;
}
