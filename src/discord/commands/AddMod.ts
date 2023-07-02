import { ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";

export class AddModCmd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;
    constructor()
    {
        super()
        this.inDev = false
        this.subcommands = null;

        this.setName("add_mod")
        this.setDescription("protects player from votekicks")

        //add string option
        const option = new SlashCommandStringOption()
        .setName("player")
        .setDescription("the oculusID of this player")
        .setRequired(true)
        this.addStringOption(option)
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        await i.deferReply({ephemeral: true})

        const playerId = i.options.get("player", true).value as string

        const rconReply = await bot.tcpClient.send(`AddMod ${playerId}`)
        const embed = new RCONReplyEmbed(rconReply)

        if(rconReply.successful)
        {   
            embed.data.fields![0].value = `Added ${playerId} as a server moderator.`
            i.followUp({embeds: [embed], ephemeral: true})
        }
        else
        {
            embed.data.fields![0].value = `Failed to add ${playerId} as a server moderator`
            i.followUp({embeds: [embed], ephemeral: true})
        }
    }
}