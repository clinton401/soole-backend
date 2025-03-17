export const approvalEmailTemplate = (email: string) => {
    const subject = "Your Admin Request Has Been Approved - Soole";
    const text = `
        Dear ${email},

        We are pleased to inform you that your admin request has been approved.
        You can now log in to your admin panel and start managing the platform.


        If you have any issues, please contact support.

        Best regards,
        Soole Team
    `;
    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Admin Request Approved</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #2c3e50; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: center; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Soole Admin Approval</div>
            <div class="content">
                <p>Dear ${email},</p>
                <p>We are pleased to inform you that your admin request has been <strong>approved</strong>.</p>
                <p>You can now log in to your admin panel and start managing the platform.</p>
          
                <p>If you have any issues, please contact support.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;
    return { subject, text, template };
};

export const rejectionEmailTemplate = (email: string, error?: string) => {
    const subject = "Your Admin Request Has Been Rejected - Soole";
    
    // Default message if no specific reason is provided
    const rejectionReason = error ? `Reason: ${error}` : "If you believe this is a mistake, please contact our support team.";

    const text = `
        Dear ${email},

        We regret to inform you that your admin request has been rejected.
        
        ${rejectionReason}
        
        Thank you for your interest in Soole.

        Best regards,
        Soole Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Admin Request Rejected</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #c0392b; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: center; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
            .reason { font-weight: bold; color: #c0392b; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Soole Admin Request Rejected</div>
            <div class="content">
                <p>Dear ${email},</p>
                <p>We regret to inform you that your admin request has been <strong>rejected</strong>.</p>
                ${error ? `<p class="reason">Reason: ${error}</p>` : "<p>If you believe this is a mistake, please contact our support team.</p>"}
                <p>Thank you for your interest in Soole.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;
    
    return { subject, text, template };
};


export const superAdminPromotionEmailTemplate = (email: string) => {
    const subject = "You Have Been Promoted to Super Admin - Soole";
    const text = `
        Dear ${email},

        Congratulations! You have been promoted to a Super Admin on Soole.
        You now have full administrative privileges, including managing other admins and overseeing platform operations.

        Please log in to your admin panel to access your new features.

        If you have any questions, feel free to contact support.

        Best regards,  
        Soole Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Super Admin Promotion</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #27ae60; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: center; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Super Admin Promotion</div>
            <div class="content">
                <p>Dear ${email},</p>
                <p>Congratulations! You have been promoted to a <strong>Super Admin</strong> on Soole.</p>
                <p>You now have full administrative privileges, including managing other admins and overseeing platform operations.</p>
                <p>Please log in to your admin panel to access your new features.</p>
                <p>If you have any questions, feel free to contact support.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, template };
};

export const superAdminDemotionEmailTemplate = (email: string) => {
    const subject = "Your Role Has Been Changed - Soole";
    const text = `
        Dear ${email},

        We would like to inform you that your role has been updated from Super Admin to Admin.
        You will still have administrative privileges, but you will no longer have access to super admin-level features.

        If you have any questions, please contact support.

        Best regards,  
        Soole Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Role Change Notification</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #e67e22; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: center; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Role Change Notification</div>
            <div class="content">
                <p>Dear ${email},</p>
                <p>We would like to inform you that your role has been updated from <strong>Super Admin</strong> to <strong>Admin</strong>.</p>
                <p>You will still have administrative privileges, but you will no longer have access to super admin-level features.</p>
                <p>If you have any questions, please contact support.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, template };
};


export const newAdminEmailTemplate = (email: string, password: string) => {
    const subject = "Your Admin Account Has Been Created - Soole";
    const text = `
        Dear ${email},

        A new admin account has been created for you on Soole.
        Below are your login details:

        Email: ${email}
        Temporary Password: ${password}

        You can log in using the Soole admin app and change your password if you wish.

        If you have any questions, please contact support.

        Best regards,  
        Soole Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Admin Account Created</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #2c3e50; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: center; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
            .password-box { font-weight: bold; background: #eee; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Welcome to Soole Admin Panel</div>
            <div class="content">
                <p>Dear ${email},</p>
                <p>A new admin account has been created for you on Soole.</p>
                <p>Here are your login details:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p class="password-box"><strong>Temporary Password:</strong> ${password}</p>
                <p>You can log in using the Soole admin app and change your password if you wish.</p>
                <p>If you have any questions, please contact support.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, template };
};


export const adminReplyEmailTemplate = (userName: string, complaint: string, reply: string) => {
    const subject = "Your Complaint Has Been Responded To - Soole";
    const text = `
        Dear ${userName},

        Your complaint has been reviewed by an admin. Below is the response:

        Complaint:
        "${complaint}"

        Admin's Response:
        "${reply}"

        If you need further assistance, feel free to reply to this email.

        Best regards,
        Soole Support Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soole - Complaint Response</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #2c3e50; color: #fff; text-align: center; padding: 20px; font-size: 24px; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; text-align: left; }
            .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
            .box { background: #f8f8f8; padding: 10px; border-radius: 5px; margin: 10px 0; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Soole Support - Complaint Response</div>
            <div class="content">
                <p>Dear ${userName},</p>
                <p>Your complaint has been reviewed by our support team. Below is the admin's response:</p>
                
                <p><strong>Your Complaint:</strong></p>
                <p class="box">${complaint}</p>

                <p><strong>Admin's Response:</strong></p>
                <p class="box">${reply}</p>

                <p>If you need further assistance, feel free to reply to this email.</p>

                <p>Best regards,<br>Soole Support Team</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} Soole. All rights reserved.</div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, template };
};

export const welcomeEmailTemplate = (email: string) => {
    const subject = "Welcome to Soole - You're on the List! 🎉";
    const text = `
        Dear ${email},

        Thank you for joining the Soole waitlist! We're thrilled to have you onboard and can't wait to share what we're building.
        Stay tuned — we'll keep you updated with the latest news and early access opportunities.

        If you didn't sign up for this waitlist, please ignore this email.

        Best regards,
        Soole Team
    `;

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Soole</title>
      <style>
        body {
          background-color: #131314;
          color: #ffffff;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #D2AC47;
          margin-bottom: 20px;
        }
        .headline {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .cta-button {
          background-color: #D2AC47;
          color: #131314;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: bold;
          display: inline-block;
          margin-top: 10px;
        }
        .cta-button:hover {
          background-color: #b8963b;
        }
        .footer {
          margin-top: 50px;
          font-size: 12px;
          color: #aaaaaa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Soole</div>
        <div class="headline">You're on the List! 🎉</div>
        <div class="message">
          Thank you for joining the Soole waitlist, ${email}! We're thrilled to have you onboard and can't wait to share what we're building. 
          Stay tuned — we'll keep you updated with the latest news and early access opportunities.
        </div>
        <div class="footer">
          If you didn't sign up for this waitlist, please ignore this email.
        </div>
      </div>
    </body>
    </html>
    `;

    return { subject, text, template };
};

