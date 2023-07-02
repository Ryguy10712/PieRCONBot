import { ChatInputCommandInteraction, SlashCommandStringOption, escapeBold } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";

export class KickCmd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;
    constructor()
    {
        super()
        this.inDev = true
        this.subcommands = null;
        this.setName("kick")
        this.setDescription("kicks a player from the server")

        //create player option
        const option = new SlashCommandStringOption()
        .setName("player")
        .setDescription("the oculus id of the player")
        .setRequired(true)

        this.addStringOption(option)
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        await i.deferReply()
        const player = i.options.get("player", true).value as string

        const rconReply = await bot.tcpClient.send(`Kick ${player}`)

        const embed = new RCONReplyEmbed(rconReply)
        if(rconReply.successful)
        {
            const rawOutput = JSON.parse(rconReply.rawOutput!)
            embed.data.fields![0].value = `Kicked ${rawOutput["UniqueID"]}`

            i.followUp({embeds: [embed]})
        }
        else
        {
            embed.data.fields![0].value = "Failed to kick player"
            i.followUp({embeds: [embed]})
        }
    }
}