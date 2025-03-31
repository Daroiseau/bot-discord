const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder } = require('discord.js');
const { getData } = require('../../database/bddFunction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nazi')
        .setDescription('Permet de définir qui est un bon nazi'),
    async execute(interaction) {
        const rand = getRandomInt(2);
        const user = interaction.user;
        if(rand === 0){
            await interaction.reply(`${user} est un bon nazi`);
        }else{
            await interaction.reply(`${user} n'est pas un bon nazi`);
        }
    }
};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  