require(`dotenv`).config();
const simpleGit = require('simple-git')();



async function syncToGithub(){
    const userName = 'Daroiseau';
    const password = process.env.GITHUB_TOKEN;
    const repo = 'bot-discord';
    const githubUrl = `https://${userName}:${password}@github.com/${userName}/${repo}`;

   
   await simpleGit.addConfig('user.name','Pablo');
   await simpleGit.addConfig('user.email','tanguymonguillon@gmail.com');
   

   // Add remore repo url as origin to repo
   simpleGit.addRemote('set-url',origin',githubUrl);
   // Add all files for commit
   await simpleGit.add('.')
      .then(
         (addSuccess) => {
            console.log(addSuccess);
         }, (failedAdd) => {
            console.log(failedAdd,'adding files failed');
      });
   // Commit files as Initial Commit
   await simpleGit.commit('commit by Pablo')
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