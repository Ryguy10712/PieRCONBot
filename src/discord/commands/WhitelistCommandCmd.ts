import { APIRole, APIUser, ButtonBuilder, ChatInputCommandInteraction, Collection, ComponentType, InteractionCollector, MessageComponentInteraction, Role, RoleSelectMenuInteraction, SlashCommandStringOption, User } from "discord.js"
import Command from "../Command"
import { RCONBot } from "../../Bot"
import { WhitelistRoleMenu, WhitelistButtonRow, WhitelistUserMenu, WhitelistEmbed } from "../components/WhitelistComponents"
import fs from "fs/promises"

export class WhitelistCmdCmd extends Command 
{
    public subcommands: Command[] | null
    public inDev: boolean
    private componentExpired: boolean = false;
    constructor(bot: RCONBot)
    {
        super()
        this.inDev = false;
        this.subcommands = null

        this.setName("whitelist_commnad")
        this.setDescription("restricts a command to a subset of users/roles")
        
        //make the option to select a command
        const cmdOption = new SlashCommandStringOption()
        .setName("command")
        .setDescription("the command to whitelist")
        .setRequired(true)
        //get the choices for the command
        for(const cmd of bot.commands.keys())
        {
            cmdOption.addChoices({name:  "/" + cmd, value: cmd})
        }
        cmdOption.addChoices({name: "/" + this.name, value: this.name}) //add self

        //user can specify if they want to whitelist by role or user
        const methodOption = new SlashCommandStringOption()
        .setName("method")
        .setDescription("choose to whitelist via role or user")
        .addChoices({name: "User", value: "user"}, {name: "Role", value: "role"})
        .setRequired(true)
        this.addStringOption(cmdOption)
        this.addStringOption(methodOption)
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        const command = i.options.get("command", true).value as string;
        const method = i.options.get("method", true).value as "user" | "role"
        let whitelist = JSON.parse(await fs.readFile("./db/whitelist.json", "utf-8"))

        //user must be admin to run this
        if(!RCONBot.isAdmin(i.user.id))
        {
            i.reply("You must bea n admin to run this command")
            return;
        }

        //create entry if it does not exist
        if(!Object.hasOwn(whitelist, command))
        {
            Object.assign(whitelist, {[command]: {"users": [], "roles": []}})
        }

        if(method == "role")
        {
            let selectedRoles: Collection<string, Role | APIRole>
            const iReply = await i.reply({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(-1)], ephemeral: true})
            const filter = (i1: MessageComponentInteraction) => 
            {
                return i.user == i1.user
            }
            
            const roleCollector = iReply.createMessageComponentCollector({componentType: ComponentType.RoleSelect, filter: filter, time: 180_000})
            //handle events for role collector
            roleCollector.on("collect", async (i1) => 
            {
                roleCollector.resetTimer()

                //make sure buttons can only be pressed when roles are greater than 0
                if(i1.roles.size >=1 )
                {
                    i1.update({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(0)]})
                }
                else
                {
                    i1.update({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(-1)]})
                }
                selectedRoles = i1.roles
            })

            roleCollector.on("end", (interactions) => 
            {
                if(roleCollector.endReason == "time") this.handleComponentExpiry(i);
            })

            const buttonCollector = iReply.createMessageComponentCollector({componentType: ComponentType.Button, filter: filter, time: 180_000})
            //handle events for buttonCollector
            buttonCollector.on("collect", async (i2) =>
            {
                //await i2.deferUpdate()
                buttonCollector.resetTimer()
                if(i2.customId == "whitelistAdd")
                {
                    buttonCollector.resetTimer()

                    const whitelistedRoles: string[] = whitelist[command]["roles"]

                    //Push items to array without duplicates
                    for(const role of selectedRoles.keys())
                    {
                        if(!whitelistedRoles.includes(role)) whitelistedRoles.push(role)
                    }

                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(1)]})
                }
                else if (i2.customId == "whitelistRemove")
                {
                    buttonCollector.resetTimer()
                    let whitelistedRoles: string[] = whitelist[command]["roles"]

                    //end early if whitelist is empty
                    if(!whitelist[command]["roles"].length)
                    {
                        return
                    }

                    for(const role of selectedRoles.keys())
                    {
                        whitelistedRoles.splice(whitelistedRoles.indexOf(role))
                    }
                    //update json
                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(2)]})
                }
                else if(i2.customId == "whitelistDelete")
                {
                    buttonCollector.resetTimer()
                   
                    whitelist[command]["roles"] = []
                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({embeds: [], components: [new WhitelistRoleMenu(false), new WhitelistButtonRow(3)]})
                }
            })

            buttonCollector.on("end", () => 
            {
                if(buttonCollector.endReason == "time") this.handleComponentExpiry(i)
            })
        }
        else if(method == "user")
        {
            let selectedUsers: Collection<string, User | APIUser>
            const iReply = await i.reply({embeds: [], components: [new WhitelistUserMenu(false), new WhitelistButtonRow(-1)]})

            //filters unwanted interactions
            const filter = (i1: MessageComponentInteraction) => 
            {
                return i.user == i1.user
            }
            
            //initialize user collector
            const userCollector = iReply.createMessageComponentCollector({componentType: ComponentType.UserSelect, filter: filter, time: 180_000})
            //handle events for role collector
            userCollector.on("collect", async (i1) => 
            {
                userCollector.resetTimer()

                //make sure buttons can only be pressed when roles are greater than 0
                if(i1.users.size >=1 )
                {
                    i1.update({components: [new WhitelistUserMenu(false), new WhitelistButtonRow(0)]})
                }
                else
                {
                    i1.update({components: [new WhitelistUserMenu(false), new WhitelistButtonRow(-1)]})
                }
                selectedUsers = i1.users
            })

            userCollector.on("end", (interactions) => 
            {
                if(userCollector.endReason == "time") this.handleComponentExpiry(i);
            })

            //init button Collector
            const buttonCollector = iReply.createMessageComponentCollector({componentType: ComponentType.Button, filter: filter, time: 180_000})
            //handle events for buttonCollector
            buttonCollector.on("collect", async (i2) =>
            {
                buttonCollector.resetTimer()
                if(i2.customId == "whitelistAdd")
                {
                    buttonCollector.resetTimer()

                    if(!selectedUsers)
                    {
                        i2.deferUpdate()
                        return;
                    }

                    const whitelistedUsers: string[] = whitelist[command]["users"]

                    //Push items to array without duplicates
                    for(const user of selectedUsers.keys())
                    {
                        if(!whitelistedUsers.includes(user)) whitelistedUsers.push(user)
                    }

                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({components: [new WhitelistUserMenu(false), new WhitelistButtonRow(1)]})
                }
                else if (i2.customId == "whitelistRemove")
                {
                    buttonCollector.resetTimer()
                    if(!selectedUsers)
                    {
                        i2.deferUpdate()
                        return;
                    }
                    const whitelist = JSON.parse(await fs.readFile("./db/whitelist.json", "utf-8"))

                    //end early if the whitelist does not exist/empty
                    if(whitelist[command]["users"].length == 0)
                    {
                        return;
                    }
                    const whitelistedUsers: string[] = whitelist[command]["users"]
                    for(const role of selectedUsers.keys())
                    {
                        whitelistedUsers.splice(whitelistedUsers.indexOf(role))
                    }
                    //update json
                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({components: [new WhitelistUserMenu(false), new WhitelistButtonRow(2)]})
                }
                else if(i2.customId == "whitelistDelete")
                {
                    buttonCollector.resetTimer()

                    whitelist[command]["users"] = []
                    await fs.writeFile("./db/whitelist.json", JSON.stringify(whitelist))
                    await i2.update({components: [new WhitelistUserMenu(false), new WhitelistButtonRow(3)]})
                }
            })

            buttonCollector.on("end", () => 
            {
                if(buttonCollector.endReason == "time") this.handleComponentExpiry(i)
            })



        }
    }

    handleComponentExpiry(i3: ChatInputCommandInteraction)
    {
        const method = i3.options.get("method", true).value as "user" | "role"

        if(!this.componentExpired)
        {
            this.componentExpired = true;
            if(method == "role")
            {
                i3.editReply({components: [new WhitelistRoleMenu(true), new WhitelistButtonRow(-1)]})
            }
            else if (method == "user")
            {
                i3.editReply({components: [new WhitelistUserMenu(true), new WhitelistButtonRow(-1)]})
            }
        }
    }
}