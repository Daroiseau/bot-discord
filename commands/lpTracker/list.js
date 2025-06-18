import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getData } from '../../database/bddFunction.js';

export default {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Permet d\'afficher les comptes enregistré'),
    async execute(interaction) {
        try {
            const data = await getData('enregistredpersons');
            await interaction.reply({embeds : [await createGameResultsEmbed(data)] })
        }catch(error){
            console.error("problème avec le leaderboard", error);
            await interaction.reply({
                content: 'Une erreur est survenue lors de la récupération des informations du joueur.',
                ephemeral: true
            });
        }
    }
};

async function createGameResultsEmbed(leaderboard){
    const embed = new EmbedBuilder()
    .setAuthor({
        name : `Leaderboard Solo/Duo queue`,
        iconURL: 'https://cdn.discordapp.com/attachments/1220074375093420142/1316399558108123177/ppDiscord.png?ex=675ae820&is=675996a0&hm=52a4de52b8f8e2cec96a0c6712b251cf121b67ed31f38f9a9af61108cd40d42f&',
    })
    .setTitle('list tracked accounts')
    .setColor('#9300f5'); // Couleur de l'embed
    let iterator = 0;
    for (const personne of leaderboard) {
        embed.addFields({ 
            name :`${personne.gamename}#${personne.tag}`,
            value: ' ', 
            inline: false 
        });
    }
    return embed;
}
