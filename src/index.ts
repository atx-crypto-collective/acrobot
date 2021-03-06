import Discord, { Message } from 'discord.js';
import markdownTable from 'markdown-table';

import {
  deleteDefinition,
  getDefinition,
  getList,
  incrementLookupCount,
  upsertDefinition,
} from './db';

const discordClient = new Discord.Client();

const botPrefix = '!';

const COMMANDS = {
  ACRO: 'acro',
  ADD: 'add',
  DEF: 'def',
  DEL: 'del',
  EDIT: 'edit',
  LIST: 'list',
};

const { ACRO, ADD, DEF, DEL, EDIT, LIST } = COMMANDS;
const DEFINE = 'define';
const DELETE = 'delete';

discordClient.on('message', async function (message: Message) {
  const { author, content, channel } = message;

  if (author.bot) return;

  if (!content.startsWith(botPrefix)) return;

  const isBotCommand = Object.values(COMMANDS).some(command => content.startsWith(`${botPrefix}${command}`));
  if (channel.type !== 'dm' && !isBotCommand) return;

  // strip da prefix
  const instructions = content.substring(1);

  // interpret message content
  const [command, ...args] = instructions.split(' ');

  switch (command) {
    // usage
    case ACRO: {
      // format with Discord's emphasis formatting ex: `add`
      const commands = Object.values(COMMANDS)
        .map(command => `\`${command}\``)
        .join(', ');

      return channel.send(`The commands I understand are ${commands}.`);
    }
    // get definition
    case DEF:
    case DEFINE: {
      // validate usage
      if (args.length !== 1) {
        return channel.send(
          `Boop! I don't know how to look that up. Try \`!def <term>\`.`,
        );
      }

      // query db
      const [item] = args;
      const term = item.toUpperCase();
      const definitionResult = await getDefinition(term);

      await incrementLookupCount(term);

      // determine bot response
      // term is found in dictionary
      if (definitionResult) {
        const { term, definition } = definitionResult;
        return channel.send(`\`${term}\`: ${definition}`);
      }
      // term is not in dictionary
      else if (definitionResult === null) {
        return channel.send(
          `Boop! Don't have that in my dictionary yet, why don't you add it using \`!add <term>: <definition>\`.`,
        );
      }
      // error thrown
      return channel.send(
        `Boop! Something went wrong. Try asking me to define the term again.`,
      );
    }
    case ADD: {
      // validate usage
      if (args.length < 2) {
        return channel.send(
          `Boop! I don't know how to add this definition. Try \`!add <term>: <definition>\`.`,
        );
      }

      const [item, ...definitionArray] = args;
      // removes : and - from the item ex: "ico:"" becomes "ico"
      const trimmedItem = item.replace(/[:-]$/, '');
      const term = trimmedItem.toUpperCase();
      const definition = definitionArray.join(' ');

      // check to see if term already exists in db
      const definitionResult = await getDefinition(term);

      // term already exists in db
      if (definitionResult) {
        return channel.send(
          `Boop! I already have this term in my dictionary. Try \`!edit <term>: <definition>\` to update it.`,
        );
      }

      // upsert term in db
      const upsertResult = await upsertDefinition(term, definition);

      // term successfully added to db
      if (upsertResult?.upsertedCount) {
        return channel.send(`Woot! \`${term}\` is now added to my dictionary!`);
      }
      // error thrown
      return channel.send(
        `Boop! Something went wrong. Try adding the term again.`,
      );
    }
    case EDIT: {
      // validate usage
      if (args.length < 2) {
        return channel.send(
          `Boop! I don't know how to edit this definition. Try \`!edit <term>: <definition>\`.`,
        );
      }

      const [item, ...definitionArray] = args;
      const trimmedItem = item.replace(/[:-]$/, '');
      const term = trimmedItem.toUpperCase();
      const definition = definitionArray.join(' ');

      // check to see if term already exists in db
      const definitionResult = await getDefinition(term);

      // determine bot response
      if (definitionResult) {
        // upsert term in db
        const upsertResult = await upsertDefinition(term, definition, definitionResult.lookupCount);

        // term successfully updated in db
        if (upsertResult?.modifiedCount) {
          return channel.send(
            `Woot! \`${term}\` is now updated in my dictionary!`,
          );
        }
        // error thrown
        return channel.send(
          `Boop! Something went wrong. Try editing the term again.`,
        );
      }
      // term does not exist in db
      return channel.send(
        `Boop! Don't have that in my dictionary yet, why don't you add it using \`!add <term>: <definition>\`.`,
      );
    }
    case DEL:
    case DELETE: {
      // validate usage
      if (args.length !== 1) {
        return channel.send(
          `Boop! I don't know how to look that up. Try \`!del <term>\`.`,
        );
      }

      const [item] = args;
      const term = item.toUpperCase();

      // delete term from db
      const result = await deleteDefinition(term);

      // determine bot response
      // no such term exist in the db
      if (result?.deletedCount === 0) {
        return channel.send(`Boop! Don't have that in my dictionary.`);
      }

      // term successfuly deleted from db
      if (result?.deletedCount === 1) {
        return channel.send(`\`${term}\` was deleted from my dictionary.`);
      }

      // error thrown
      return channel.send(
        `Boop! Something went wrong. Try deleting the term again.`,
      );
    }
    case LIST: {
      const result = await getList();

      if (result) {
        const tuples = result.map(item => [item.term, item.definition]);

        const table = markdownTable([['Terms', 'Definitions'], ...tuples]);

        return channel.send(`Here is a list of my top words:
          \`\`\`${table}\`\`\``);
      }

      // error thrown
      return channel.send(`Boop! Something went wrong. Try again.`);
    }
    default:
      channel.send(
        `Boop! I don't understand this command. Try !acro to see what I can do.`,
      );
  }
  return;
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
