import { ChatInputCommandInteraction, Interaction, SlashCommandStringOption } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";


export default class ResetSNDCmd extends Command 
{
    public subcommands: Command[] | null;
    public inDev: boolean
    
    constructor()
    {
        super()
        this.subcommands = null;
        this.inDev = false;
        this.setName("reset_snd");
        this.setDescription("resets snd")

        //create 5 slots for blue team
        for(let i = 0; i < 5; i++)
        {
            this.addStringOption(
                new SlashCommandStringOption()
                .setName(`blue${i + 1}`)
                .setDescription(`Enter player in-game username`)
            )
        }

        //create 5 options for ready team
        for(let i = 0; i < 5; i++)
        {
            this.addStringOption(
                new SlashCommandStringOption()
                .setName(`red${i + 1}`)
                .setDescription(`Enter player in-game username`)
            )
        }
    }
    
    public override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
       await i.deferReply()
       let movedPlayer: boolean = false;

        //move blue players to blue team
        for(let index = 0; index < 5; index++)
        {
            const option = i.options.get(`blue${index + 1}`)?.value as string | null
            if(option)
            {
                movedPlayer = true;
                bot.tcpClient.send("Switchteam 0 " + option)
            }
        }

        //populate red team with red players
        for(let index = 0; index < 5; index++)
        {
            const option = i.options.get(`red${index + 1}`)?.value as string | null
            if(option)
            {
                movedPlayer = true;
                bot.tcpClient.send("SwitchTeam 1 " + option)
            }
        }

        //if players are moved, wait a bit before resetting SND
        const timeout: number = movedPlayer ? 3_000 : 0
        setTimeout(async () => 
        {
            const reply = await bot.tcpClient.send("ResetSND")
            const embed = new RCONReplyEmbed(reply)
            if(reply.successful)
            {
                
                const fieldValue = movedPlayer ? "Successfully ResetSND and players" : "Successfuly ResetSND"
                embed.data.fields![0].value = fieldValue
                i.followUp({embeds: [embed]})
            }
            else
            {
                embed.data.fields![0].value = "Failed to reset SND"
                i.followUp({embeds: [embed]})
            }
        }, timeout)
        
    }   
    
}