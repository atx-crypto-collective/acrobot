import Discord, { Message } from 'discord.js';
import { getDefinition } from './db';

const discordClient = new Discord.Client();

const prefix = '!';

discordClient.on('message', async function (message: Message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const result = await getDefinition();

  return message.channel.send(`${result.item}: ${result.definition}`);
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
