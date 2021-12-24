const discord = require("discord.js");
const DB = require("quick.db");
const fs = require("fs");
const config = require("./config.json");
const bot = new discord.Client({disableEveryone: true});

const SnakeGame = require('./snake-game');
const HangmanGame = require('./hangman-game');
const Connect4 = require('./connect4');
//const Chess = require('./chess');
const express = require('express');

const snakeGame = new SnakeGame(bot);
const hangman = new HangmanGame(bot);
const connect4 = new Connect4(bot);
//const chess = new Chess(bot);

const db = JSON.parse(fs.readFileSync("./database.json", "utf8"));

// When bot ready
bot.on("ready", async () => {
  console.log(`${bot.user.username} is ready for action!`);
  bot.user.setPresence({
    activity: {
        name: 'p!help',
        type: 'LISTENING'
    },
    status: 'dnd',
});
});

// Load commands
bot.commands = new discord.Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  let jsfiles = files.filter(f => f.split(".").pop() === "js");

  if (jsfiles.length <= 0) return console.log("There are no commands to load...");

  console.log(`Loading ${jsfiles.length} commands...`);
  jsfiles.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

// Message event
bot.on("message", async message => {

  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'p!snake') {
    snakeGame.newGame(message);
}
else if (message.content.toLowerCase() === 'p!hangman') {
    hangman.newGame(message);
}
else if (message.content.toLowerCase() === 'p!connect4') {
    connect4.newGame(message);
}
//else if (message.content.toLowerCase() === 'p!chess') {
    //chess.newGame(message);
//}

  if (!db[message.author.id]) db[message.author.id] = {
    xp: 0,
    level: 0,
    msgs: 0,
  };
  db[message.author.id].xp++
  db[message.author.id].msgs++
let userInfo = db[message.author.id];
if(userInfo.xp > (69 * userInfo.level)) {
    userInfo.level++
    userInfo.xp = 0
    let embed3 = new discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic : true }))
    .setColor(0x4286f4)
    .setDescription(`GG ${message.author.username}, you are now Level ${userInfo.level}!`)
    message.channel.send(embed3);
}
fs.writeFile("./database.json", JSON.stringify(db), (x) => {
  if (x) console.error(x)
});

  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  const args = message.content.slice(config.prefix.length).trim().split(" ");
  let cmd = bot.commands.get(command.slice(prefix.length));

  if(DB.has(`afk-${message.author.id}+${message.guild.id}`)) {
    const info = DB.get(`afk-${message.author.id}+${message.guild.id}`)
    await DB.delete(`afk-${message.author.id}+${message.guild.id}`)
  
    const embed = new discord.MessageEmbed()
    .setDescription(`Welcome back!`)
    .setColor("BLUE")
    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic : true }))
    message.channel.send(embed)

};
if (!command.startsWith(prefix)) return;

  if (message.channel.type === "dm") return;

//checking for mentions
if(message.mentions.members.first()) {
    if(DB.has(`afk-${message.mentions.members.first().id}+${message.guild.id}`)) {

      const embed = new discord.MessageEmbed()
      .setDescription(message.mentions.members.first().user.tag + " Is currently AFK! Reason: " + DB.get(`afk-${message.mentions.members.first().id}+${message.guild.id}`))
      .setColor("BLUE")
      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic : true }))
      message.channel.send(embed)

        
    }else return;
}else;
if (cmd) {cmd.run(bot, message, args);
}
});

bot.login(config.token);

