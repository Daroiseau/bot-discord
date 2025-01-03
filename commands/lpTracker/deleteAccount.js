const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const filePath = path.resolve(__dirname, '../../informations/AccountDiscordToLol.json');
const fs = require('fs').promises; // Utilisation de fs.promises pour les opérations asynchrones
const {EmbedBuilder } = require('discord.js');

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
        try {
            const pseudo = interaction.options.getString('pseudo');
            const tag = interaction.options.getString('tag');
            if(await reWriteJSON(filePath, pseudo, tag)){
                await interaction.reply("Le compte a bien été supprimé");
            }else{
                await interaction.reply("Le compte n'as pas pu être supprimé, il n'existe pas");
            }
        }catch(error){
            console.error("problème avec le leaderboard", error);
        }
    }
};

async function reWriteJSON(filePath, pseudo, tag) {
    try {
        let existingData = [];

        //lire son contenu
        const fileContent = await fs.readFile(filePath, 'utf-8');
        existingData = JSON.parse(fileContent); // Parse le contenu JSON existant

        // Vérifier si les données existent déjà dans le fichier
        const isDataExists = existingData.some(item => item.gameName === pseudo) && existingData.some(item => item.tag === tag);
        
        if (isDataExists) {
            // Ajouter les nouvelles données si elles n'existent pas déjà
            const index = existingData.findIndex(personne => personne.gameName === pseudo && personne.tag === tag );
            existingData.splice(index,1);

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
