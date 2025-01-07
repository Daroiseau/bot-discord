const {EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getData, updateData } = require('../database/bddFunction');


//tableau avec toutes les valeurs que j'ai besoins pour le message 
const m_data = {pseudo :'', gameStatue :'', lp : '', lpGeneral :'', tier :'', rank :'', color :'', kills :'', deaths :'', assists :'', champion :'', queue :'', wins :'', losses :'', gameID :'', win :"", promotion:""};

async function trackingLp(client, riotKey) {
    const interval = 10000; // Intervalle en millisecondes (10 secondes)
    const Data = await getData('enregistredpersons');
    //const jsonObject = JSON.parse(jsonData);
    console.log("vérification des dernières games jouées par les personnes inscrites");

        for (const item of Data) {

            //item.id = summonner id;
            const played = await getPlayerLastSoloDuo(riotKey,item.puuid,item.lastgameid);
            if(played){
                m_data.pseudo = item.gamename + '#'+ item.tag;
                await getPlayerRankAndLp(item.id,riotKey,item.lp,item.tier, item.rank);
                await updateLastGameID(item.puuid, m_data.gameID, m_data.lpGeneral, m_data.rank, m_data.tier);
                
                await scheduleMessage(client);
            }
            await sleep(interval); // Pause entre chaque élément
        }

        // Re-lancer après avoir traité tous les éléments relancer toutes les 10 mins (600000)
        console.log("fin de la vérification");
        setTimeout(() => trackingLp(client, riotKey), 600000);}




// Fonction principale pour afficher le rang et les LP
async function getPlayerRankAndLp(summonerId,riotKey, lastLp, lastTier, lastRank ) {
    
    try {
        const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotKey}`;
        const response = await axios.get(url);
        const leagueEntries = response.data;

        let tierChanged = false;
        let rankChanged = false;

        // Filtrer pour les parties classées en solo/duo
        const soloQueue = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
        if (soloQueue) {
            m_data.queue = soloQueue.queueType;
            m_data.tier = soloQueue.tier;
            m_data.rank = soloQueue.rank;
            m_data.lpGeneral = soloQueue.leaguePoints; // nb lp gagné ou perdu 
            if (lastTier !== m_data.tier) {
                tierChanged = true;
            }
            if (lastRank !== m_data.rank) {
                rankChanged = true;
            }
            const lpDefined = (lastLp !== undefined && m_data.lpGeneral !== undefined);
            if(lpDefined){
                if(!tierChanged && !rankChanged){
                    m_data.lp = m_data.lpGeneral-lastLp;
                    m_data.promotion = "no";
                }else if(m_data.gameStatue ==="win"){
                    m_data.promotion = "up";
                    m_data.lp = (100-lastLp)+m_data.lpGeneral;
                }else{
                    m_data.promotion = "down";
                    m_data.lp = (100-m_data.lpGeneral)+lastLp;
                }
            }
            
            m_data.wins = soloQueue.wins;
            m_data.losses = soloQueue.losses;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error.message);
    }
}

async function getPlayerLastSoloDuo(riotKey, puuid,lastGameID){
    //récupérer les dernières parties 
    try {
        const responses = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=1&api_key=${riotKey}`);
        const gameIDs = responses.data;
        if(!Array.isArray(gameIDs) || !(gameIDs.length > 0)){
            return false;
        }
        const GameID = gameIDs[0];
        if ((lastGameID === GameID) && (lastGameID !== "")){
            return false;
        }else{
            const response = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${GameID}?api_key=${riotKey}`);
            const matchDetails = response.data;
            if(matchDetails.info.queueId !== 420){
                return false;
            }
            const playerStats = matchDetails.info.participants.find(participant => participant.puuid === puuid);
            m_data.kills = playerStats.kills;
            m_data.deaths = playerStats.deaths;
            m_data.assists = playerStats.assists;
            m_data.champion = playerStats.championName;
            m_data.color = playerStats.win ? '#1eff00' : '#ff0000';
            m_data.gameStatue = playerStats.win ? 'win' : 'lose';
            m_data.gameID = GameID;
            return true;
        }

    }catch (error){
        console.error("ici en bas",'Erreur lors de la récupération des données :', error.message);
        return false;
    }
   
}

//permet de savoir le channel ou le bot va devoir écrire les messages 
async function getChannelForWriting(){
    let data = await getData('lptrackerchannel', {id : 1});
    return data[0].idchannel;
}

//mise en forme du message 
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

// Fonction pour envoyer un message programmé
async function scheduleMessage(client) {
        try {
            const channelId = await getChannelForWriting();
            const channel = await client.channels.fetch(channelId);
            if (channel /*&& channel.isTextBased()*/) {
                await channel.send({embeds : [createGameResultsEmbed(m_data)] });
            } else {
                console.error('Le channel spécifié n\'est pas textuel ou n\'existe pas.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message automatique :', error);
        }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateLastGameID(puuid, newGameID, newLp, newRank, newTier) {
    try {
        await updateData('enregistredpersons', {lastgameid : newGameID, lp : newLp, rank : newRank, tier : newTier}, {puuid : puuid})
    } catch (error) {
        console.error('Erreur dans updateLastGameId : ', error);
    }
}

module.exports = { trackingLp };