import { Resend } from 'resend';

export interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  invitationToken: string;
  residenceNames: string[];
  role: string;
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'onboarding@resend.dev') {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async sendInvitationEmail(params: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
      const invitationUrl = `https://smart-homes.pages.dev/invite/${params.invitationToken}`;
      
      const residencesList = params.residenceNames.length > 0 
        ? params.residenceNames.map(name => `• ${name}`).join('\n')
        : 'Ninguna asignada aún';

      const roleLabel = params.role === 'admin' ? 'Administrador' : 'Cliente';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Smart Spaces</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9F9F9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: -0.5px;">
                Smart Spaces
              </h1>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
                Infrastructure OS
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
                Has sido invitado a Smart Spaces
              </h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                <strong>${params.inviterName}</strong> te ha invitado a unirte a la plataforma Smart Spaces como <strong>${roleLabel}</strong>.
              </p>

              <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                  Espacios Asignados
                </p>
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.8; white-space: pre-line;">
${residencesList}
                </p>
              </div>

              <p style="margin: 30px 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Para completar tu registro, haz clic en el siguiente botón:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${invitationUrl}" 
                       style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Aceptar Invitación
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace;">
                ${invitationUrl}
              </p>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                  ⚠️ Este enlace expirará en <strong>7 días</strong>. Si no completas tu registro antes de esa fecha, deberás solicitar una nueva invitación.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                Smart Spaces MX
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                624 144 7227 • ventas@smartspaces.com.mx
              </p>
            </td>
          </tr>

        </table>

        <!-- Legal -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                Este correo fue enviado porque ${params.inviterName} te invitó a Smart Spaces.<br>
                Si no esperabas este mensaje, puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const textContent = `
Smart Spaces - Invitación

Has sido invitado a unirte a Smart Spaces

${params.inviterName} te ha invitado a unirte a la plataforma Smart Spaces como ${roleLabel}.

Espacios asignados:
${residencesList}

Para completar tu registro, visita:
${invitationUrl}

Este enlace expirará en 7 días.

---
Smart Spaces MX
624 144 7227
ventas@smartspaces.com.mx
      `.trim();

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `🏠 Invitación a Smart Spaces - ${roleLabel}`,
        html: htmlContent,
        text: textContent,
      });

      return { success: true };

    } catch (error) {
      console.error('Error sending invitation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al enviar email'
      };
    }
  }
}
