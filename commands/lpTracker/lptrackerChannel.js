const { SlashCommandBuilder } = require('discord.js');
const { updateData } = require('../../database/bddFunction');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('createrankchannel')
        .setDescription('Permet de définir le channel où vont être affiché les informations des games classés')
        .setDescription(' des comptes enregistrés')
        .addStringOption(option => 
            option.setName('rankchannel')
                .setDescription('Nom du salon où vont être affiché les informations (mettre l\'identifiant')
                .setRequired(true)
        ),
    async execute(interaction) {
        const channelName = interaction.options.getAny('rankchannel');
        try {
            const res = await updateData('lptrackerchannel',{idchannel : channelName}, {id : 1});
            if(res != 0){
                await interaction.reply('Channel ajouté avec succès.');
            }else{
                await interaction.reply(`Problème avec l'initialisation du channel`);
            }
        }catch{
            console.error(`Erreur dans lpTrackerChannel:`, error);
            throw error; // Rejette l'erreur pour pouvoir la gérer dans l'exécution de la commande

        }
    }
};


