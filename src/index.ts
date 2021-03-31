import Discord, { Message } from 'discord.js';
import { getDefinition } from './db';

const discordClient = new Discord.Client();

const prefix = '!';

discordClient.on('message', async function (message: Message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  // strip da prefix
  const item = message.content.substring(1);
  
  const result = await getDefinition(item);
  if (!result) {
    message.channel.send(`Boop! Don't have that in my dictionary yet, why don't you add it using !add <term> <definition>`)
  } else {
    const { item: term, definition } = result;
    message.channel.send(`${term}: ${definition}`);
  }
  return;
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
