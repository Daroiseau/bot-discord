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

function createGameResultsEmbed(m_data){
    const embed = new EmbedBuilder()
    .setAuthor({
        name : `Pablo`,
        iconURL: 'https://cdn.discordapp.com/attachments/1220074375093420142/1316399558108123177/ppDiscord.png?ex=675ae820&is=675996a0&hm=52a4de52b8f8e2cec96a0c6712b251cf121b67ed31f38f9a9af61108cd40d42f&',
    })
    .setTitle(m_data.gameStatue === "win" ? 'Victory' : 'Defeat')
    .setDescription( m_data.promotion === "up" ? `${m_data.pseudo} a ${m_data.gameStatue} ${m_data.lp} league points et a été promu ${m_data.tier} ${m_data.rank} avec ${m_data.lpGeneral}  lp` 
                    : m_data.promotion ==="down" ? `${m_data.pseudo} a ${m_data.gameStatue} ${m_data.lp} league points et a été relégué ${m_data.tier} ${m_data.rank} avec ${m_data.lpGeneral}  lp`
                    :`${m_data.pseudo} a ${m_data.gameStatue} ${m_data.lp} league points et arrive ${m_data.tier} ${m_data.rank} ${m_data.lpGeneral}  lp`)
    .setColor(m_data.color || '#ffffff') // Couleur de l'embed
    .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${m_data.champion}.png`)
    // Ajouter des champs (fields)
    .addFields(
        {
          name: "score",
          value: m_data.kills+'/'+m_data.deaths+'/'+m_data.assists || "non disponible",
          inline: true
        },
        {
          name: "champion",
          value:  m_data.champion || "Non disponible",
          inline: true
        },
        {
          name: "queue",
          value: m_data.queue || "Non disponible",
          inline: true
        },
      );
    
    return embed;
}
