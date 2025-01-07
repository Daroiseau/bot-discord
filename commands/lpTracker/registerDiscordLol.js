const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require(`dotenv`).config();
const  riotAPIKey  = process.env.riotAPIKey;
const path = require('path');
const ecriture = path.resolve(__dirname, '../../informations/AccountDiscordtoLOl.json');
const fs = require('fs').promises; // Utilisation de fs.promises pour les opérations asynchrones
const m_data = {discordName : '', gameName :'', tag :'', puuid : '', id :'', accountId : '', profileIconId : '', revisionDate : '', summonerLevel :'', lastGameID : '', lp :'', rank:'', tier :''};


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
        m_data.discordName = interaction.options.getString('discordaccount');
        const summonerInfo = await getSummonerInfo(summonerName, summonerTag);

        if (summonerInfo) {
            m_data.gameName = summonerInfo.gameName;
            m_data.tag = summonerInfo.tagLine;
            m_data.puuid = summonerInfo.puuid;
            const summonerOtherInfo = await getOtherSummonerInfo(m_data.puuid);

            if(summonerOtherInfo){
                m_data.id = summonerOtherInfo.id;
                m_data.accountId = summonerOtherInfo.accountId;
                m_data.profileIconId = summonerOtherInfo.profileIconId;
                m_data.revisionDate = summonerOtherInfo.revisionDate;
                m_data.summonerLevel = summonerOtherInfo.summonerLevel;
                await getPlayerRankAndLp(m_data.id,riotAPIKey);
                await getLastGameID(m_data.puuid,riotAPIKey);
                try {
                    // Sauvegarde des données dans un fichier JSON
                    const ajout = await writeJSON(ecriture, m_data);
                    if(ajout){
                        await interaction.reply('Compte discord et lol bien associés.');
                    }else{
                        await interaction.reply('Compte discord et lol déjà associés.');
                    }
                    
                } catch (error) {
                    console.error('Erreur lors de l\'écriture dans le fichier JSON:', error);
                    await interaction.reply('Erreur lors de l\'enregistrement des données.');
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

async function getPlayerRankAndLp(summonerId,riotKey) {
    
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

async function getLastGameID(puuid, riotKey){
    try {
        const responses = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=1&api_key=${riotAPIKey}`);
        const gameIDs = responses.data;
        if(!Array.isArray(gameIDs) || !(gameIDs.length > 0)){
            m_data.lastGameID = "";
            return;
        }
        m_data.lastGameID = gameIDs[0];
    }catch(error){
        console.error('Erreur lors de la récupération des données :', error.message);
    }
}


// Fonction d'écriture dans un fichier JSON
async function writeJSON(filePath, data) {
    try {
        let existingData = [];

        // Vérifier si le fichier existe déjà et lire son contenu
        const fileExists = await fileExistsCheck(filePath);
        if (fileExists) {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            existingData = JSON.parse(fileContent); // Parse le contenu JSON existant
        }

        // Vérifier si les données existent déjà dans le fichier
        const isDataExists = existingData.some(item => item.puuid === data.puuid);
        
        if (!isDataExists) {
            // Ajouter les nouvelles données si elles n'existent pas déjà
            existingData.push(data);

            // Convertir les données combinées en chaîne JSON
            const jsonData = JSON.stringify(existingData, null, 2);

            // Réécrire le fichier avec les nouvelles données
            await fs.writeFile(filePath, jsonData);
            console.log(`Données ajoutées au fichier ${filePath}`);
            return true;
        } else {
            console.log('Les données existent déjà dans le fichier. Aucune modification effectuée.');
            return false;
        }
    } catch (error) {
        console.error(`Erreur d'écriture dans le fichier ${filePath}:`, error);
        throw error; // Rejette l'erreur pour pouvoir la gérer dans l'exécution de la commande
    }
}

// Vérification de l'existence du fichier
async function fileExistsCheck(filePath) {
    try {
        await fs.access(filePath);
        return true; // Le fichier existe
    } catch (error) {
        return false; // Le fichier n'existe pas
    }
}

