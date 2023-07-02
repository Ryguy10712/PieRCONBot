import { ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";

export default class CustomCmd extends Command 
{
    public subcommands: Command[] | null = null
    public inDev = false;
    
    constructor()
    {
        super()
        this.setName("custom")
        this.setDescription("sends a custom RCON command")

        const strOption = new SlashCommandStringOption()
        .setName("command")
        .setDescription("the custom command")
        .setRequired(true)

        this.addStringOption(strOption);
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        await i.deferReply()
        const str = i.options.get("command", true).value as string
        const reply = await bot.tcpClient.send(str)
        
        if(reply.successful)
        {
            const embed = new RCONReplyEmbed(reply)
            
            const replyData = JSON.parse(reply.rawOutput!)
            
            //populate embed fields
            if(replyData["UniqueID"])
            {
                embed.addFields({name: "UniqueID", value: replyData["UniqueID"], inline: true})
            }

            //if additional command data is too large, send to DM
            if(JSON.stringify(replyData[replyData["Command"]]).length > 50)
            {
                embed.setFooter({text: "Additonal command data has been sent to your dms"})
                i.user.send(JSON.stringify(replyData[replyData["Command"]]))
            }
            else
            {
                embed.setDescription(JSON.stringify(replyData[replyData["Command"]]))
            }

            embed.data.fields![0].value = `Successfully executed ${replyData["Command"]} command`
            embed.data.fields![0].inline = true

            i.followUp({embeds: [embed]})
        }
        else
        {
            i.followUp("failed to execute custom command")
        }
    }
} 