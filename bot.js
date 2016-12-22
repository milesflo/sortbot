const Discord = require("discord.js");
const auth = require("./auth.json");
const char = '>';

const bot = new Discord.Client();

bot.checkRole = (msg, role) => {
	if (msg.guild.roles.find('name',role) != undefined) {
		let foundRole = msg.guild.roles.find('name',role);
		if (msg.member.roles.has(foundRole.id)){
			return true;
		} else {
			return false;
		}
	} else {
		console.log(`WARNING! Role not found: ${role}`);
		return false;
	}
}

const commands = {
	'ping': {
		process: (msg) => {
			console.log("pong")
		}
	},
	'addrole': {
		process: () => {

		}
	}
}


bot.login(auth.token);

bot.on('ready', () => {
	console.log("ready, m8");
})

bot.on('message', (msg) => {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm') return;
	// if not something the bot cares about, exit out
	if(msg.content.startsWith(char)) {
		//Trim the mention from the message and any whitespace
		let command = msg.content.substring(msg.content.indexOf(char),msg.content.length).trim();
		if (command.startsWith(char)) {
			//Get command to execute
			let to_execute = command.split(char).slice(1).join().split(' ')[0];
			//Get string after command
			let argument = command.split(char).slice(1).join().split(' ').slice(1).join(" ");
			if (commands[to_execute]) {
				commands[to_execute].process(msg, argument)
			}
		}  else {
			//once every x minutes, give poster y xp
			return level.msgXp(msg,3,5);
		}
	}
});
