import Discord, { Message } from 'discord.js';

import { getDefinition, upsertDefinition } from './db';

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
    case 'acro': {
      const commands = COMMANDS.join(', ');
      return channel.send(`The commands I understand are ${commands}.`)
    }
    // get definition
    case 'def': {
      // validate usage
      if (args.length !== 1) return channel.send(`Boop! I don't know how to look that up. Try !def <term>`);

      // query db
      const [item] = args;
      const term = item.toUpperCase();
      const result = await getDefinition(term);

      // determine bot response
      if (!result) {
        return channel.send(`Boop! Don't have that in my dictionary yet, why don't you add it using !add <term> <definition>`);
      } else {
        const { item: term, definition } = result;
        return channel.send(`${term}: ${definition}`);
      }
    }
    case 'add': {
      // validate usage
      if (args.length < 2) return channel.send(`Boop! I don't know how to add this definition. Try !add <term> <definition>`);

      // upsert item in db
      const [item, ...definitionArray] = args;
      const term = item.toUpperCase();
      const definition = definitionArray.join(' ');
      await upsertDefinition(term, definition);

      return channel.send(`Woot! ${term} is now added to my dictionary!`)
    }
    case 'edit':
    case 'del':
    default:
      channel.send(`Boop! I don't understand this command. Try !acro to see what I can do.`)
  }
  return;
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
