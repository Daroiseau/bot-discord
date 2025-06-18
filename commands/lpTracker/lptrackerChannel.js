import { SlashCommandBuilder } from 'discord.js';
import { updateData } from '../../database/bddFunction.js';



export default {
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
        const channelName = interaction.options.getString('rankchannel');
        try {
            const res = await updateData('lptrackerchannel',{idchannel : channelName}, {id : 1});
            if(res != 0){
                await interaction.reply('Channel ajouté avec succès.');
            }else{
                await interaction.reply(`Problème avec l'initialisation du channel`);
            }
        }catch{
            console.error(`Erreur dans lpTrackerChannel:`, error);
            await interaction.reply({
                content: "Une erreur est survenue lors de la création du channel.",
                ephemeral: true // Only the user who invoked the command will see this message
            });
        }
    }
};


