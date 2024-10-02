import { transporter } from "../config/nodemailer";

type EmailType = {
    email: string,
    name: string,
    token: string
};

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.cl>',
            to: user.email,
            subject: 'UpTask - Activación de cuenta',
            text: 'UpTask - Activación de cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask. Ya casi está todo listo, sólo debes confirmar tu cuenta</p>
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>E ingresa el código: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`,
        });
        console.log('Email sent: %s', info.messageId);
    }
    static sendPasswordResetToken = async (user: EmailType) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.cl>',
            to: user.email,
            subject: 'UpTask - Reestablece tu contraseña',
            text: 'UpTask - Reestablece tu contraseña',
            html: `<p>Hola ${user.name}, has solicitado reestablecer tu contraseña.</p>
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer contraseña</a>
            <p>E ingresa el código: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`,
        });
        console.log('Email sent: %s', info.messageId);
    }
}
