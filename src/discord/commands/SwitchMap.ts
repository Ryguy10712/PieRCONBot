import { ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import Command from "../Command";
import { RCONBot } from "../../Bot";
import RCONReplyEmbed from "../components/RCONResponseEmbed";

export class SwitchMapCmd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;

    constructor()
    {
        super()
        this.subcommands = null;
        this.inDev = true;
        this.setName("switchmap")
        this.setDescription("switches the map and gamemode")

        //create map option
        const mapOption = new SlashCommandStringOption()
        .setName("map")
        .setDescription("id of the map to switch to")
        .setRequired(true)

        const modeOption = new SlashCommandStringOption()
        .setName("gamemode")
        .setDescription("The gamemode to switch to")
        .setChoices(
            {name: "Search and Destory", value: "snd"}, {name: "Gun Game", value:  "gun"},
            {name: "Push", value: "push"}, {name: "Team Deathmatch", value: "tdm"},
            {name: "Deathmatch", value: "dm"}, {name: "WW2 TDM", value: "tanktdm"},
            {name: "One in The Chamber", value: "oitc"}, {name: "TTT", "value": "ttt"}, 
            {name: "Zombies", value: "zwv"}, {name: "The Hidden", value: "hide"},
            {name: "Infection", value: "infection"}, {name: "Prop Hunt", value: "prophunt"}
        )
        .setRequired(true)

        //append the options
        this.addStringOption(mapOption)
        .addStringOption(modeOption);
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        const map = i.options.get("map", true).value as string
        const mode = i.options.get("gamemode", true).value as string
        const reply = await bot.tcpClient.send(`SwitchMap ${map} ${mode}`)
        
        
        const embed = new RCONReplyEmbed(reply)
        const replyData = JSON.parse(reply.rawOutput!)

        if(reply.successful)
        {
            embed.data.fields![0].value = `Switched map to ${map}`
            i.reply({embeds: [embed]})
        }
        else
        {
            embed.data.fields![0].value = `Failed to switch map to ${map}`
            i.reply({embeds: [embed]})
        }

    }

}