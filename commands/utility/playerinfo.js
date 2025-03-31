const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require(`dotenv`).config();
const {EmbedBuilder } = require('discord.js');
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
            const rankInfo = await getRankedInfo(summonerInfo.puuid);
            const OtherSumInfo = await getOtherSummonerInfo(summonerInfo.puuid);
            await interaction.reply({embeds : [createGameResultsEmbed(rankInfo, OtherSumInfo, summonerInfo)] })
        } else {
            await interaction.reply('Impossible de trouver ce joueur.');
        }
    }
};

/**
 * puuid
 * tag
 * gamename
 */
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

/**
 *  id
    accountid 
    profileiconid 
    revisiondate 
    summonerlevel 
 */
async function getOtherSummonerInfo(puuid) {
    try {
        const response = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${riotAPIKey}`
        );
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Riot dans la fonction getSummonerOtherInfo', error);
        return null;
    }
}

/**
 * tier, rank, lp, wins, looses...
 */
async function getRankedInfo(puuid){
    try {
        const response = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${riotAPIKey}`);
        return response.data[0];
    }catch (error){
        console.error('Erreur lors de l\'appel à l\'API Riot dans la fonction getRankedInfo', error);
        return null;
    }
}


function createGameResultsEmbed(rankInfo, OtherSumInfo, summonerInfo){
    let ratio = Math.floor(rankInfo.wins / (rankInfo.wins + rankInfo.losses)*100);
    const embed = new EmbedBuilder()
    .setAuthor({
        name : `Pablo`,
        iconURL: 'https://cdn.discordapp.com/attachments/1220074375093420142/1316399558108123177/ppDiscord.png?ex=675ae820&is=675996a0&hm=52a4de52b8f8e2cec96a0c6712b251cf121b67ed31f38f9a9af61108cd40d42f&',
    })
    .setTitle(`Info sur le joueur ${summonerInfo.gameName}#${summonerInfo.tagLine}`)
    .setDescription(`${summonerInfo.gameName}#${summonerInfo.tagLine} est ${rankInfo.tier} ${rankInfo.rank} ${rankInfo.leaguePoints} lp avec ${ratio} % de victoires (${rankInfo.wins} wins et ${rankInfo.losses} losses)`)
    .setColor('#00b0f4') // Couleur de l'embed
    .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${OtherSumInfo.profileIconId}.png`);
    // Ajouter des champs (fields)
    return embed;
}
