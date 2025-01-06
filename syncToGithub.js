require(`dotenv`).config();
const simpleGit = require('simple-git')();
const shellJs = require('shelljs');


async function syncToGithub(){
    shellJs.cd('../bot-discord/');
    const repo = 'bot-discord';
    const userName = `Daroiseau`;
    const tokenGithub = process.env.GITHUB_TOKEN;
    const githubUrl = `https://${userName}:${tokenGithub}@github.com/${userName}/${repo}`;


    simpleGit.addConfig('user.email','balvinder294@gmail.com');
    simpleGit.addConfig('user.name','Balvinder Singh');
    // Add remore repo url as origin to repo
    simpleGit.addRemote('origin',githubUrl);
    await simpleGit.add('.')
    .then(
       (addSuccess) => {
          console.log(addSuccess);
       }, (failedAdd) => {
          console.log(failedAdd,'adding files failed');
    });
    // Commit files as Initial Commit
    await simpleGit.commit('Intial commit by simplegit')
        .then(
            (successCommit) => {
                console.log(successCommit);
            }, (failed) => {
                console.log(failed,'failed commmit');
            });
    // Finally push to online repository
    await simpleGit.push('origin','bot-commit')
        .then((success) => {
            console.log('repo successfully pushed');
        },(failed)=> {
            console.log(failed,'repo push failed');
        });
}

module.exports = { syncToGithub };