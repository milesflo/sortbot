const Discord = require("discord.js");
const auth = require("./auth.json");
const char = '--';
const knex = require('knex')(require('./knexfile.js'));

const bot = new Discord.Client();

function del(msg) {
	if (msg.deletable) msg.delete(0);
}

bot.checkRole = (msg, roleArr) => {
	for (var i = roleArr.length - 1; i >= 0; i--) {
		if (msg.guild.roles.find('name',roleArr[i]) != undefined) {
			let foundRole = msg.guild.roles.find('name',roleArr[i]);
			if (msg.member.roles.has(foundRole.id)){
				return true;
			}
		} else {
			console.log(`WARNING! Role not found: ${role}`);
		}
	}
	return false;
}

bot.setFaction = function(msg, roleName) {
	let targetRole = msg.guild.roles.find("name",roleName);
	let r = msg.member.roles;
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

bot.requestInvite = (msg, roleName)=>{
	msg.author.sendMessage(`You've requested to join ${roleName}. A member of that faction will accept/deny your invite soon.`)
	.then(()=>{
		knex('role_queue').insert({
			'user_id':msg.author.id,
			'server_id':msg.guild.id,
			'role_name':roleName
		}).returning("id").then((id)=> {
			let queueId = id;
			let roleId = msg.guild.roles.find("name", roleName).id;
			//get the user ID's of all officers for this role's ID, for Private Message.
			knex('officers').select('*').where({
				'role_id':roleId
			}).then((rows)=> {
				for (var i = 0;i < rows.length;i++) {
					bot.users.get(rows[i].user_id).sendMessage(`${msg.author} would like to join your faction, ${roleName}.\nTo allow them to join, say \`--acceptInvite ${queueId}\``)
				}
			})
		})
	})
	
}

const commands = {
	'help': {
		process: (msg, arg) => {
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
			bot.requestInvite(msg,"Brotherhood of Steel");
		},
		description: "Request to join the Brotherhood of Steel"
	},
	'legion': {
		process: (msg,arg)=> {
			bot.requestInvite(msg,"Caesar's Legion");
		},
		description: "Request to join the Legion"
	},
	'ncr': {
		process: (msg,arg)=> {
			bot.requestInvite(msg,"New California Republic");
		},
		description: "Request to join the NCR"
	},
	'enclave': {
		process: (msg,arg)=> {
			bot.requestInvite(msg,"Enclave");
		},
		description: "Request to join the Enclave"
	},
	'auxilia': {
		process: (msg,arg)=> {
			bot.requestInvite(msg,"Auxilia");
		},
		description: "Request to join Auxilia Mercenary Company"
	},
	'dragon': {
		process: (msg,arg)=> {
			bot.requestInvite(msg,"Dragon's Order");
		},
		description: "Request to join the Dragon's Order"
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
				if (target.highestRole.name === 'Ranger'||target.highestRole.name === 'Overseer') {
					msg.member.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value)=>{
						msg.channel.sendMessage("_The bot fries your hand as you attempt this treasonous act, rendering you incapable of interacting with the bot any further_");
					})
				} else {
					if (bot.checkRole(msg,["Overseer","Ranger"])) {
						target.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value) => {
							msg.channel.sendMessage(`${target} has had their bot privileges revoked until further notice.`)
						}, (reason) => {
							console.log(reason);
						});
					} else {
						msg.channel.sendMessage("Access Denied.");
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
		},
		discrete: true
	},
	'update': {
		process: (msg,arg)=> {
			if (msg.author.id === "127060142935113728") {
				msg.channel.sendMessage("fetching updates...").then(function(sentMsg){
					console.log("updating...");
					var spawn = require('child_process').spawn;
					var log = function(err,stdout,stderr){
						if(stdout){console.log(stdout);}
						if(stderr){console.log(stderr);}
					};
					var fetch = spawn('git', ['fetch']);
					fetch.stdout.on('data',function(data){
						console.log(data.toString());
					});
					fetch.on("close",function(code){
						var reset = spawn('git', ['pull','origin/master']);
						reset.stdout.on('data',function(data){
							console.log(data.toString());
						});
						reset.on("close",function(code){
							var npm = spawn('npm', ['install']);
							npm.stdout.on('data',function(data){
								console.log(data.toString());
							});
							npm.on("close",function(code){
								console.log("goodbye");
								sentMsg.edit("brb!").then(function(){
									bot.destroy().then(function(){
										process.exit();
									});
								});
							});
						});
					});
				});
			}
		},
		discrete: true
	},
	'acceptInvite': {
		process:(msg,arg)=> {
			// Find the request in request database. arg = id.
			knex('role_queue').select('*').where({
				'id':arg
			}).then((rows)=>{
				if (rows.length>0) {
					var entry = rows[0];
					var server = bot.guilds.find('id',entry.server_id);
					//Add role
					server.members.find('id',entry.user_id).addRole(server.roles.find('name',entry.role_name)).then(()=> {
						knex('role_queue').where({
							'id':arg
						}).del().then(()=> {
							console.log("Role grant completed; queue entry deleted.")
						})
					})
				} else {
					msg.author.sendMessage("User with that ID not in queue.")
				}
			})
		},
		discrete:true
	},
	// An officer is someone that gets PM'd requests for a Role from the bot, whenever someone makes a request with --ncr, --bos, etc.
	'addOfficer': {
		process: (msg,arg)=> {
			if (!bot.checkRole(msg,["Overseer","Ranger"])) return;
			if (msg.mentions.users.first() != undefined) {
				let target = msg.mentions.users.first();
				let targetId = target.id;
				knex('officers').select('*').where({
					'user_id':targetId
				}).then((rows)=>{
					if (rows.length==0) {
						let roleId = msg.guild.members.find('id',targetId).highestRole.id;
						knex('officers').insert({
							'user_id':targetId,
							'role_id':roleId
						}).then(()=> {
							msg.channel.sendMessage(`${target} has been made an officer of ${msg.guild.roles.find('id',roleId).name}`)
						}).catch((err)=> {
							console.log("Problem adding user to officer's table")
						})
					} else {
						let hasOfficers = "";
						for (var i = rows.length - 1; i >= 0; i--) {
							hasOfficers+=`- ${msg.guild.roles.find("id",rows[i].role_id).name}\n`;
						}
						msg.channel.sendMessage("User is already an officer in the following groups:\n"+hasOfficers);
					}
				})
			}  else {
				msg.channel.sendMessage("Mention a user to add as officer.")
			}
		}
	},
	// Demote an officer.
	'removeOfficer': {
		process: (msg,arg)=> {
			if (!bot.checkRole(msg,["Overseer","Ranger"])) return;
			if (msg.mentions.users.first() != undefined) {
				let target = msg.mentions.users.first();
				let targetId = target.id;
				knex('officers').select('*').where({
					'user_id':targetId
				}).then((rows)=>{
					if (rows.length>0) {
						let role = msg.guild.roles.find("id",rows[0].role_id);
						knex('officers').where({
							'user_id':targetId
						}).del().then(()=> {
							msg.channel.sendMessage(`${target} has been demoted from an officer of ${role.name}`)
						}).catch((err)=> {
							console.log("Problem adding user to officer's table")
						})
					} else {
						msg.channel.sendMessage("User is not an officer.")
					}
				})
			}  else {
				msg.channel.sendMessage("Mention a user to demote from officer.")
			}
		}
	},
	'isOfficer': {
		process: (msg, arg) => {
			if (!bot.checkRole(msg,["Overseer","Ranger"])) return;
			if (msg.mentions.users.first() != undefined) {
				let target = msg.mentions.users.first();
				let targetId = target.id;
				knex('officers').select('*').where({
					'user_id':targetId
				}).then((rows)=> {
					if (rows.length > 0) {
						let hasOfficers = "";
						for (var i = rows.length - 1; i >= 0; i--) {
							hasOfficers+=`- ${msg.guild.roles.find("id",rows[i].role_id).name}\n`;
						}
						msg.channel.sendMessage(`${target} is an officer of these groups:\n
							${hasOfficers}`);
						return;
					}  else {
						msg.channel.sendMessage(`${target} is not an officer.`)
					}
				})
			}

		}
	}
}

bot.login(auth.token);

bot.on('ready', () => {
	bot.user.setGame(`Say ${char}help`).then(()=> {
		console.log(`${bot.user.username} ready!`);
	}).catch((err)=>{
		console.log(err);
	})
})

bot.on("guildMemberAdd", (newMember) => {
	newMember.addRole(newMember.guild.roles.find("name","Dweller"))
	.then(newMember.guild.channels.find("name", "goodsprings").sendMessage(`Welcome to the official NV:MP Discord, ${newMember}. Be sure to read all the rules before posting, and _Enjoy Your Stay!_`))
	.catch((err)=>{
		console.log("Problem with guildMemberAdd:\n",err);
	});
})

bot.on('message', (msg) => {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm'&&!msg.cleanContent.startsWith(char+'acceptInvite')||msg.channel.type !== 'dm'&&bot.checkRole(msg,["Blacklisted"])) return;
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

bot.on('messageDelete', (msg)=> {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm'||msg.content.startsWith(char)) return;
	msg.guild.channels.find('name', 'logs').sendMessage(`${msg.author} just deleted this message:\n${msg.cleanContent}`)
})

