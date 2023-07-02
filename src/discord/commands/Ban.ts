import { SlashCommandStringOption, ChatInputCommandInteraction } from "discord.js";
import { RCONBot } from "../../Bot";
import Command from "../Command";
import RCONReplyEmbed from "../components/RCONResponseEmbed";



export class BanCmd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;
    constructor()
    {
        super()
        this.inDev = false
        this.subcommands = null;
        this.setName("ban")
        this.setDescription("bans a player from the server")

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

        const rconReply = await bot.tcpClient.send(`Ban ${player}`)

        const embed = new RCONReplyEmbed(rconReply)
        if(rconReply.successful)
        {
            const rawOutput = JSON.parse(rconReply.rawOutput!)
            embed.data.fields![0].value = `Banned ${rawOutput["UniqueID"]}`

            i.followUp({embeds: [embed]})
        }
        else
        {
            embed.data.fields![0].value = "Failed to ban player"
            i.followUp({embeds: [embed]})
        }
    }
}