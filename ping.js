const discord = require("discord.js");
module.exports.run = async (bot, message, args) => {

  let embed = new discord.MessageEmbed()
  .setAuthor(message.author.tag, message.author.avatarURL({dynamic : true}))
  .setTitle("Pong!")
  .addField(`Ping is ${Date.now() - message.createdTimestamp}ms.`, ` API Ping is ${bot.ws.ping}ms.`)
  .setTimestamp();
  message.channel.send(embed)
};

module.exports.help = {
  name : "ping"
}