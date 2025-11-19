import nodemailer from 'nodemailer';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let discordClient: Client | null = null;

// Initialize Discord bot
export async function initializeDiscordBot() {
  try {
    const settings = await prisma.chapterSettings.findFirst();
    
    if (settings?.discordEnabled && settings.discordBotToken) {
      discordClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
        ],
      });
      
      await discordClient.login(settings.discordBotToken);
      console.log('✅ Discord bot connected');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error);
  }
}

// Send email notification
export async function sendEmailNotification(
  to: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const settings = await prisma.chapterSettings.findFirst();
    
    if (!settings?.emailEnabled || !settings.emailHost) {
      console.log('Email notifications not configured');
      return false;
    }
    
    const transporter = nodemailer.createTransport({
      host: settings.emailHost,
      port: settings.emailPort || 587,
      secure: settings.emailPort === 465,
      auth: {
        user: settings.emailUser,
        pass: settings.emailPassword,
      },
    });
    
    await transporter.sendMail({
      from: settings.emailUser,
      to,
      subject,
      text: message,
    });
    
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Send Discord notification
export async function sendDiscordNotification(message: string): Promise<boolean> {
  try {
    const settings = await prisma.chapterSettings.findFirst();
    
    if (!settings?.discordEnabled || !settings.discordChannelId || !discordClient) {
      console.log('Discord notifications not configured');
      return false;
    }
    
    const channel = await discordClient.channels.fetch(settings.discordChannelId);
    
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(message);
      console.log('✅ Discord message sent');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to send Discord message:', error);
    return false;
  }
}

// Initialize Discord on module load
initializeDiscordBot();

