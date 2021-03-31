import Discord, { Message } from 'discord.js';

import { getDefinition } from './db';

const discordClient = new Discord.Client();

const prefix = '!';

const COMMANDS = ['acro', 'def', 'add', 'edit', 'del'];

discordClient.on('message', async function (message: Message) {
  const { author, content, channel } = message;

  if (author.bot) return;
  if (!content.startsWith(prefix)) return;

  // strip da prefix
  const instructions = content.substring(1);

  // interpret message content
  const [command, ...args] = instructions.split(' ');

  switch (command) {
    // usage
    case 'acro':
      const commands = COMMANDS.join(', ');
      channel.send(`The commands I understand are ${commands}.`)
      break;
    // get definition
    case 'def':
      if (args.length !== 1) channel.send(`Boop! I don't know how to look that up. Try !def <term>`);
      const [ item ] = args;
      const result = await getDefinition(item);
      if (!result) {
        channel.send(`Boop! Don't have that in my dictionary yet, why don't you add it using !add <term> <definition>`)
      } else {
        const { item: term, definition } = result;
        channel.send(`${term}: ${definition}`);
      }
      break;
    case 'add':
    case 'edit':
    case 'del':
    default:
      channel.send(`Boop! I don't understand this command. Try !acro to see what I can do.`)
  }
  return;
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
