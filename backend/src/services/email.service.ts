import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async enviarEmailRecuperacion(
    email: string,
    nombre: string,
    token: string
  ): Promise<boolean> {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await resend.emails.send({
        from: 'Sistema de Inventarios <onboarding@resend.dev>',
        to: email,
        subject: 'Recuperación de Contraseña',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                .content { background-color: #f9fafb; padding: 40px 30px; }
                .button { display: inline-block; background-color: #2563eb; color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">🔐 Recuperación de Contraseña</h1>
                </div>
                <div class="content">
                  <p style="font-size: 16px;">Hola <strong>${nombre}</strong>,</p>
                  <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" class="button">Restablecer Contraseña</a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">O copia y pega este enlace:</p>
                  <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px; font-size: 13px;">
                    ${resetLink}
                  </p>
                  
                  <div class="warning">
                    <p style="margin: 0; font-size: 14px;"><strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>.</p>
                  </div>
                  
                  <p style="margin-top: 30px; color: #6b7280;">Si no solicitaste este cambio, ignora este email.</p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">Sistema de Inventarios © 2025</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return true;
    } catch (error) {
      console.error('Error al enviar email con Resend:', error);
      return false;
    }
  }
}