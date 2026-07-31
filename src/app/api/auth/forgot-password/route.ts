import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const rl = checkRateLimit(`forgot:${email}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Sempre responde com sucesso — não revelar se o e-mail existe ou não.
  if (user) {
    const token = nanoid(32);
    await prisma.verificationToken.create({
      data: {
        token,
        type: "PASSWORD_RESET",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendEmail({
      to: user.email,
      subject: "Redefinir senha — Furikai",
      html: resetPasswordEmailHtml(user.name, `${appUrl}/redefinir-senha/${token}`),
    });
  }

  return NextResponse.json({ ok: true });
}
