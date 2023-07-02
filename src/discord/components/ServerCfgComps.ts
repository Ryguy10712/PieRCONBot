import { ActionRowBuilder } from "@discordjs/builders";
import { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export class SuccessEmbed extends EmbedBuilder
{
    constructor(ip: string, port: string)
    {
        super()
        this.setTitle("Success")
        this.addFields({name: "IP", value: ip,}, {name: "Port", value: port})
        this.setFooter({text: "If any of the given info is incorrect, RCON commands will not work"})
        this.setColor("Orange")
    }
}

export class PasswordModal extends ModalBuilder
{
    constructor()
    {
        super()
        this.setTitle("RCON Password")
        .setCustomId("rconPasswordModal")
        //creat component 
        const textInput = new TextInputBuilder()
        .setLabel("Enter Password")
        .setCustomId("rconPasswordInput")
        .setMinLength(1)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Password")

        const field = new ActionRowBuilder<TextInputBuilder>()
        .addComponents(textInput)

        this.addComponents(field)
        
    }
}