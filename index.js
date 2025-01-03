const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
require(`dotenv`).config();
const tokenDiscord  = process.env.tokenDiscord;
const  riotAPIKey  = process.env.riotAPIKey;
const  {trackingLp}  = require('./lpTracker/lptracker.js'); // Import du fichier secondaire
const http = require('http');

// Port par défaut fourni par Render
const PORT = process.env.PORT || 3000;




const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	//const interval = 6000; // Intervalle en millisecondes (par exemple, ici toutes les 6 secondes)


	// Créer un serveur web minimal
	http.createServer((req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('Bot is running!');
	}).listen(PORT, () => console.log(`Server running on port ${PORT}`));

    trackingLp(client, riotAPIKey);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(tokenDiscord);