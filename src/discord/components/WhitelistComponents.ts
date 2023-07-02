import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, EmbedBuilder, RoleSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";

enum WhitelistButtonState
{
    Disabled = -1,
    Default = 0,
    AddPressed = 1,
    RemovePressed = 2,
    DeletePressed = 3
}

export class WhitelistRoleMenu extends ActionRowBuilder<RoleSelectMenuBuilder>
{
    constructor(disabled: boolean)
    {
        super()
        const menu = new RoleSelectMenuBuilder()
        .setCustomId("whitelistRoleMenu")
        .setPlaceholder("Select the role(s) you wish to alter")
        .setMaxValues(25)
        .setMinValues(0)
        .setDisabled(disabled)
        
        this.addComponents(menu)
    }
}

export class WhitelistUserMenu extends ActionRowBuilder<UserSelectMenuBuilder>
{
    constructor(disabled: boolean)
    {
        super()
        const menu = new UserSelectMenuBuilder()
        .setCustomId("whitelistUserMenu")
        .setPlaceholder("Select the user(s) you wish to alter")
        .setMaxValues(25)
        .setMinValues(0)
        .setDisabled(disabled)

        this.addComponents(menu)
    }
}

export class WhitelistButtonRow extends ActionRowBuilder<ButtonBuilder>
{
    constructor(state: WhitelistButtonState)
    {
        super()
        const AddButton = new ButtonBuilder()
        .setCustomId("whitelistAdd")
        .setLabel("Add")
        .setStyle(ButtonStyle.Primary)
        
        const RemoveButton = new ButtonBuilder()
        .setCustomId("whitelistRemove")
        .setLabel("Remove")
        .setStyle(ButtonStyle.Secondary)

        const DeleteButton = new ButtonBuilder()
        .setCustomId("whitelistDelete")
        .setLabel("Delete whitelist")
        .setStyle(ButtonStyle.Danger)

        //adjust buttons based on state
        switch(state)
        {
            case WhitelistButtonState.Disabled:
                AddButton.setDisabled(true)
                RemoveButton.setDisabled(true)
                break;
            case WhitelistButtonState.AddPressed:
                AddButton.setStyle(ButtonStyle.Success)
                break;
            case WhitelistButtonState.RemovePressed:
                RemoveButton.setStyle(3)
                break;
            case WhitelistButtonState.DeletePressed:
                DeleteButton.setStyle(3)
        }

        this.addComponents(AddButton, RemoveButton, DeleteButton)

    }
}

export class WhitelistEmbed extends EmbedBuilder
{
    private readonly cmdWhitelist: {roles: [], users: []}
    private readonly i: ChatInputCommandInteraction
    constructor(cmdWhitelist: {roles: [], users: []}, i: ChatInputCommandInteraction)
    {
        super()
        this.cmdWhitelist = cmdWhitelist
        this.i = i
        this.setColor(0x2b2d31) //discord embed color
        this.setTitle("Current Whitelist")

    }

    async init()
    {
        let roleFieldValue = ""
        for (const id of this.cmdWhitelist.roles)
        {
            const role = this.i.guild?.roles.resolve(id)
            if(role)
            {
                roleFieldValue += `${role?.name}\n`
            }   
        }
        if(!roleFieldValue)
        {
            roleFieldValue == "..."
        }

        let userFieldValue = ""
        for(const id of this.cmdWhitelist.users)
        {
            //check cache first, if not there then fetch
            let member
            member = this.i.guild?.members.cache.get(id)
            if(!member)
            {
                member = await this.i.guild?.members.fetch(id)
            }
            if(!member)
            {
                return
            }

            userFieldValue += `${member.user.username} \n`
        }

        if(!userFieldValue) userFieldValue = "..."

        this.addFields({name: "Roles", value: roleFieldValue}, {name: "Users", value: userFieldValue, inline: true})
    }
}