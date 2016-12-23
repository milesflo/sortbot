const Discord = require("discord.js");
const auth = require("./auth.json");
const char = '--';

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

bot.setFaction = function(msg, roleName) {
	targetRole = msg.guild.roles.find("name",roleName);
	if (targetRole!=undefined) {
		msg.member.removeRoles(msg.member.roles).then(()=>{
			msg.member.addRole(targetRole.id).then(()=> {
				console.log(`User joined ${roleName}`);
			}).catch((err)=> {
				console.log(`Something went very wrong with the ${roleName} command.`,err)
			})
		})
	}
}

const commands = {
	'help': {
		process: (msg, argument) => {
			let commandList = 'Available Commands:```'
			for (cmd in commands) {
				if (!commands[cmd].discrete) {
					let command = char + cmd;
					let usage = commands[cmd].usage;
					if (usage) {
						command += " " + usage;
					}
					let description = commands[cmd].description;
					if(description){
						command += "\n\t" + description;
					}
					commandList+=command+"\n";
				}
			}
			commandList += "```\n";
			msg.author.sendMessage(commandList)
		},
		description: "Messages user list of commands",
		discrete:true
	},
	'ping': {
		process: (msg,arg) => {
			console.log("pong");
		},
		description: "Ping the bot to test its respons time."
	},
	'bos': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Brotherhood of Steel");
		},
		description: "Join the Brotherhood of Steel"
	},
	'legion': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Caesar's Legion");
		},
		description: "Join the Legion"
	},
	'ncr': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"New California Republic");
		},
		description: "Join the NCR"
	},
	'enclave': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Enclave");
		},
		description: "Join the Enclave"
	},
	'revoke':{
		process: (msg)=>{
			if (msg.mentions.users.first() != undefined) {
				let target = msg.guild.member(msg.mentions.users.first());
				console.log(target);
				if (target.highestRole.name === 'Ranger'||'Overseer') {
					msg.member.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value)=>{
						msg.channel.sendMessage("_The bot fries your hand as you attempt this treasonous act, rendering you incapable of interacting with the bot any further_");
					})
				} else {
					if (bot.checkRole(msg,"Ranger")||bot.checkRole(msg,"Overseer")) {
						target.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value) => {
							msg.channel.sendMessage(`${target} has had their bot privileges revoked until further notice.`)
						}, (reason) => {
							console.log(reason);
						});
					} else {
						bot.reject(msg);
					}
				}
			} else {
				msg.channel.sendMessage("Mention a user to revoke.")
			}
		},
		usage:"<@target>",
		description: "Revoke bot privileges from target. Requires permissions."
	}
	// 'addrole': {
	// 	process: (msg,arg) => {

	// 	},
	// 	description: ""
	// }
}

bot.login(auth.token);

bot.on('ready', () => {
	bot.user.setGame(`Say ${char}help`).then(()=> {
		console.log("ready, m8");
	}).catch((err)=>{
		console.log(err);
	})
})

bot.on('message', (msg) => {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm') return;
	// if not something the bot cares about, exit out
	if (msg.content.startsWith(char)) {
		//Trim the mention from the message and any whitespace
		let command = msg.content.substring(msg.content.indexOf(char),msg.content.length).trim();
		if (command.startsWith(char)) {
			//Get command to execute
			let to_execute = command.split(char).slice(1).join().split(' ')[0];
			//Get string after command
			let arg = command.split(char).slice(1).join().split(' ').slice(1).join(" ");
			if (commands[to_execute]) {
				commands[to_execute].process(msg, arg)
			}
		}  else {
			//once every x minutes, give poster y xp
			return level.msgXp(msg,3,5);
		}
	}
});
