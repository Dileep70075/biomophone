// src/services/notificationService.js
import nodemailer from 'nodemailer';

export const sendReminder = async (event) => {
  try {
    // Setup nodemailer transporter (example with Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password', // Use environment variables for this!
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'recipient-email@example.com', // Logic to get attendees here
      subject: `Reminder: ${event.title} is happening soon!`,
      text: `Don't forget! The event "${event.title}" is happening on ${event.date}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder sent for event: ${event.title}`);
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
};
