const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const filePath = path.resolve(__dirname, '../../informations/AccountDiscordtoLOl.json');
const fs = require('fs').promises; // Utilisation de fs.promises pour les opérations asynchrones
const {EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Permet d\'afficher les comptes enregistré'),
    async execute(interaction) {
        try {
            const jsonData = await fs.readFile(filePath, 'utf-8');
            const jsonObject = JSON.parse(jsonData);
            await interaction.reply({embeds : [await createGameResultsEmbed(jsonObject)] })
        }catch(error){
            console.error("problème avec le leaderboard", error);
        }
    }
};

async function createGameResultsEmbed(leaderboard){
    const embed = new EmbedBuilder()
    .setAuthor({
        name : `Leaderboard Solo/Duo queue`,
        iconURL: 'https://cdn.discordapp.com/attachments/1220074375093420142/1316399558108123177/ppDiscord.png?ex=675ae820&is=675996a0&hm=52a4de52b8f8e2cec96a0c6712b251cf121b67ed31f38f9a9af61108cd40d42f&',
    })
    .setTitle('Current leaderboard of tracked accounts')
    .setColor('#9300f5'); // Couleur de l'embed
    let iterator = 0;
    for (const personne of leaderboard) {
        embed.addFields({ 
            name :`${personne.gameName}#${personne.tag}`,
            value: ' ', 
            inline: false 
        });
    }
    return embed;
}
