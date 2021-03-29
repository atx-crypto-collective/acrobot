import Discord from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Discord.Client();

const prefix = '!';

client.on('message', function (message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  return message.channel.send('test!');
});

client.login(process.env.DISCORD_BOT_TOKEN);
