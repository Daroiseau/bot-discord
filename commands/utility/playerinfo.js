const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require(`dotenv`).config();
const  riotAPIKey  = process.env.riotAPIKey;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerinfo')
        .setDescription('Get info of a player')
        .addStringOption(option => 
            option.setName('playername')
                .setDescription('The name of the player')
                .setRequired(true)
        )
        .addStringOption(option2 => 
            option2.setName('tag')
                .setDescription('The tag of the player')
                .setRequired(true)
        ),
    async execute(interaction) {
        const summonerName = interaction.options.getString('playername');
        const summonerTag = interaction.options.getString('tag');
        const summonerInfo = await getSummonerInfo(summonerName, summonerTag);

        if (summonerInfo) {
            await interaction.reply(`Nom du joueur : ${summonerInfo.gameName}#${summonerInfo.tagLine}\npuuid : ${summonerInfo.puuid}`);
        } else {
            await interaction.reply('Impossible de trouver ce joueur.');
        }
    }
};

async function getSummonerInfo(summonerName, tag) {
    try {
        const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tag}?api_key=${riotAPIKey}`
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Riot dans la fonction getSummonerInfo', error);
        return null;
    }
}
