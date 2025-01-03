const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const filePath = path.resolve(__dirname, '../../informations/AccountDiscordtoLOl.json');
const fs = require('fs').promises; // Utilisation de fs.promises pour les opérations asynchrones
const {EmbedBuilder } = require('discord.js');

const rankList = ["IV","III","II","I"];
const tierList = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const leaderboard = [{}];



module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Permet d\'afficher le leaderboard des parties classés des personnes enregistré'),
    async execute(interaction) {
        try {
            const jsonData = await fs.readFile(filePath, 'utf-8');
            const jsonObject = JSON.parse(jsonData);
            await compare(jsonObject);
            await interaction.reply({embeds : [await createGameResultsEmbed()] })
            //console.log(leaderboard);
        }catch(error){
            console.error("problème avec le leaderboard", error);
        }
    }
};

async function compare(jsonObject){
    for (const [index, item] of jsonObject.entries()) {
        const point = `${tierList.indexOf(item.tier)}`+`${rankList.indexOf(item.rank)}`;
        leaderboard.push({name : item.gameName,point : point, tier : item.tier, rank :item.rank, lp : item.lp });
    }
    leaderboard.sort((a, b) =>  b.point - a.point);
    leaderboard.splice(0,1);
}

async function createGameResultsEmbed(){
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
