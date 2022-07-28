const config = require('./config.json');
const Discord = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Create the Discord bot and its prefix.
const client = new Discord.Client({intents:["Guilds","GuildMembers","GuildMessages","GuildMessageReactions","GuildPresences"]});

// Retrieve the commands for the Discord bot and store them in a Discord collection.
client.commands = new Discord.Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
}

// Retrieve the events for the Discord bot.
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Parse commands in the Discord server.
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
    }
});

// Connect to the Discord application.
client.login(config.token);