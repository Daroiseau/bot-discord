const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const filePath = path.resolve(__dirname, '../../informations/lpTrackerChannel.json');
const fs = require('fs').promises; // Utilisation de fs.promises pour les opérations asynchrones



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
            await fs.writeFile(filePath, channelName);
            await interaction.reply('Channel ajouté avec succès.');
        }catch{
            console.error(`Erreur d'écriture dans le fichier ${filePath}:`, error);
            throw error; // Rejette l'erreur pour pouvoir la gérer dans l'exécution de la commande
            await interaction.reply(`Problème avec l'initialisation du channel`);

        }
    }
};


