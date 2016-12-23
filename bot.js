const Discord = require("discord.js");
const auth = require("./auth.json");
const char = '--';

const bot = new Discord.Client();

function del(msg) {
	if (msg.deletable) msg.delete(0);
}


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
	let targetRole = msg.guild.roles.find("name",roleName);
	let r = msg.member.roles;
	console.log(roleName,targetRole);
	if (targetRole!=undefined) {
		msg.member.removeRoles(r)
			.then((member)=>{
				member.addRole(targetRole)
			.then(()=> {
				console.log(`User joined ${roleName}`);
				return del(msg);
			}).catch((err)=> {
				console.log(`Something went very wrong with the ${roleName} command.`,err)
			})
		})
	}  else {
		console.log(`Role ${roleName} does not exist`);
	}
}

const commands = {
	'help': {
		process: (msg, argument) => {
			let commandList = 'Available Commands:```\n'
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
			let output = msg.author.sendMessage(commandList);
			return del(msg);
		},
		description: "Messages user list of commands"
	},
	'ping': {
		process: (msg,arg) => {
			msg.reply("Pong!")
		},
		description: "Ping the bot."
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
	'auxilia': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Auxilia");
		},
		description: "Join Auxilia Mercenary Company"
	},
	'dragon': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Dragon's Order");
		},
		description: "Join the Dragon's Order"
	},
	'leaveall': {
		process: (msg,arg)=> {
			bot.setFaction(msg,"Dweller");
		},
		description: "Leave all factions and become a Dweller"
	},
	'revoke':{
		process: (msg)=>{
			if (msg.mentions.users.first() != undefined) {
				let target = msg.guild.member(msg.mentions.users.first());
				console.log(target.highestRole.name);
				console.log(msg.member.highestRole.name);
				if (target.highestRole.name === 'Ranger'||target.highestRole.name === 'Overseer') {
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
	}, 
	'projectpurity': {
		process:(msg) => {
			// for fixing all of the oopsies
			if (msg.author.id==="127060142935113728") {
				let plebs = msg.guild.members.findAll("highestRole","@everyone")
				console.log(plebs);
				for (i = 0; i<plebs.length;i++) {
					plebs[i].addRole(msg.guild.roles.find("name","Dweller"));
				}

				msg.channel.sendMessage(`${plebs.length} members purified.`).then((outgoingMsg)=> {
					del(outgoingMsg);
				});

			}  else {
				return msg.channel.sendMessage("Your Science stat is not high enough.. :wink:")
			}
		}
	}
	// 'newrole': {
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

bot.on("guildMemberAdd", (newMember) => {
	newMember.addRole(newMember.guild.roles.find("name","Dweller"))
	.then()
	.catch((err)=>{
		console.log("Problem with guildMemberAdd:\n",err);
	});
})

bot.on('message', (msg) => {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm'||bot.checkRole(msg,"Blacklisted")) return;
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
				commands[to_execute].process(msg, arg);
			}
		}
	}
});
