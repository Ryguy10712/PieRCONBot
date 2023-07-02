import { ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";

export class RemoveModCd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;
    constructor()
    {
        super()
        this.inDev = false
        this.subcommands = null;

        this.setName("remove_mod")
        this.setDescription("removes vote-kick protection")

        //add string option
        const option = new SlashCommandStringOption()
        .setName("player")
        .setDescription("the oculusID of this player")
        .setRequired(true)
        this.addStringOption(option)
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        await i.deferReply()

        const playerId = i.options.get("player", true).value as string

        const rconReply = await bot.tcpClient.send(`RemoveMod ${playerId}`)
        const embed = new RCONReplyEmbed(rconReply)

        if(rconReply.successful)
        {   
            embed.data.fields![0].value = `Removed ${playerId} as a server moderator.`
            i.followUp({embeds: [embed], ephemeral: false})
        }
        else
        {
            embed.data.fields![0].value = `Failed to remove ${playerId} as a server moderator`
            i.followUp({embeds: [embed]})
        }
    }
}