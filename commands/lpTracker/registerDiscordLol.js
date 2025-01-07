const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require(`dotenv`).config();
const  riotAPIKey  = process.env.riotAPIKey;
const { insertData } = require('../../database/bddFunction');
const m_data = {discordname : '', gamename :'', tag :'', puuid : '', id :'', accountid : '', profileiconid : '', revisiondate : '', summonerlevel :'', lastgameid : '', lp :'', rank:'', tier :''};


module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('register a player with a discord account, it works one time')
        .addStringOption(option => 
            option.setName('discordaccount')
                .setDescription('The discord account')
                .setRequired(true)
        )
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
        m_data.discordname = interaction.options.getString('discordaccount');
        const summonerInfo = await getSummonerInfo(summonerName, summonerTag);

        if (summonerInfo) {
            m_data.gamename = summonerInfo.gameName;
            m_data.tag = summonerInfo.tagLine;
            m_data.puuid = summonerInfo.puuid;
            const summonerOtherInfo = await getOtherSummonerInfo(m_data.puuid);

            if(summonerOtherInfo){
                m_data.id = summonerOtherInfo.id;
                m_data.accountid = summonerOtherInfo.accountId;
                m_data.profileiconid = summonerOtherInfo.profileIconId;
                m_data.revisiondate = summonerOtherInfo.revisionDate;
                m_data.summonerlevel = summonerOtherInfo.summonerLevel;
                await getPlayerRankAndLp(m_data.id);
                await getLastGameID(m_data.puuid);
                try {
                    // Sauvegarde des données dans un fichier JSON
                    const res = await insertData('enregistredpersons',m_data);
                    if(res !== undefined){
                        await interaction.reply('Compte discord et lol bien associés.');
                    }else{
                        await interaction.reply('Compte discord et lol déjà associés.');
                    }
                    
                } catch (error) {
                    console.error('Erreur dans registerDiscordLol:', error);
                    await interaction.reply('Compte discord et lol déjà associés');
                }
            }
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

async function getPlayerRankAndLp(summonerId) {
    
    try {
        const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotAPIKey}`;
        const response = await axios.get(url);
        const leagueEntries = response.data;

        // Filtrer pour les parties classées en solo/duo
        const soloQueue = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5');

        if (soloQueue) {
            m_data.lp = soloQueue.leaguePoints;
            m_data.rank = soloQueue.rank;
            m_data.tier = soloQueue.tier;           
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error.message);
    }
}

async function getLastGameID(puuid){
    try {
        const responses = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=1&api_key=${riotAPIKey}`);
        const gameIDs = responses.data;
        if(!Array.isArray(gameIDs) || !(gameIDs.length > 0)){
            m_data.lastgameid = "";
            return;
        }
        m_data.lastgameid = gameIDs[0];
    }catch(error){
        console.error('Erreur lors de la récupération des données :', error.message);
    }
}

