const { SlashCommandBuilder } = require('discord.js');
const { deleteData } = require('../../database/bddFunction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteaccount')
        .setDescription('Permet de supprimer un compte enregistré')
        .addStringOption(option => 
            option.setName('pseudo')
                .setDescription('The lol pseudo')
                .setRequired(true)
        ).addStringOption(option => 
            option.setName('tag')
                .setDescription('The tag of the lol pseudo')
                .setRequired(true)
        ),
    async execute(interaction) {
        const pseudo = interaction.options.getString('pseudo');
        const tag = interaction.options.getString('tag');
        try{
            const res = await deleteData('enregistredpersons',{gameName : pseudo, tag : tag});
            if(res != 0){
                await interaction.reply("Le compte a bien été supprimé");
            }else{
                await interaction.reply("Le compte n'as pas pu être supprimé, il n'existe pas");
            }
        }catch(err){
            console.error('Error in deleteaccount : ',err);
        }
    }
};
