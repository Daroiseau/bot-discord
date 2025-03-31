const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder } = require('discord.js');
const { getData } = require('../../database/bddFunction');

const rankList = ["","IV","III","II","I"];
const tierList = ["UNRANKED","IRON","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];




module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Permet d\'afficher le leaderboard des parties classés des personnes enregistré'),
    async execute(interaction) {
        try {
            const data = await getData('enregistredpersons');
            const leaderbord = await compare(data);
            await interaction.reply({embeds : [await createGameResultsEmbed(leaderbord)] })

        }catch(error){
            console.error("problème avec le leaderboard", error);
        }
    }
};

async function compare(data){
    const leaderboard = [{}];
    for (const item of data) {
        const point = `${tierList.indexOf(item.tier)}`+`${rankList.indexOf(item.rank)}`;
        leaderboard.push({name : item.gamename,point : point, tier : item.tier, rank :item.rank, lp : item.lp });
    }
    leaderboard.sort((a, b) =>  b.point - a.point);
    leaderboard.splice(0,1);
    return leaderboard;
}

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
        iterator++;
        embed.addFields({ 
            name : `${iterator}`, 
            value:  `${personne.name}(${personne.tier} ${personne.rank} ${personne.lp})` , 
            inline: false 
        });
    }
    return embed;
}


//nombres.sort((a, b) => a - b); // Tri croissant
