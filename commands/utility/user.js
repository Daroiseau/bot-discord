import { SlashCommandBuilder } from 'discord.js';

// a modifié pour que ce soit raccord avec le bot 
export default{
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		let joinedAt = 'unknown';
		if (interaction.member && interaction.member.joinedAt) {
			joinedAt = new Date (interaction.member.joinedAt).toLocaleDateString();
		}
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};