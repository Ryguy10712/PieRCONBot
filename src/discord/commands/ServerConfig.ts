import { ChatInputCommandInteraction, Embed, ModalBuilder, SlashCommandStringOption } from "discord.js";
import Command from "../Command"
import { RCONBot } from "../../Bot";
import PavTCPClient from "../../tcpClient/tcpClient";
import crypto from "node:crypto"
import { PasswordModal, SuccessEmbed } from "../components/ServerCfgComps";

export class ServerCfgCmd extends Command
{
    public subcommands: Command[] | null;
    public inDev: boolean;
    
    constructor()
    {
        super()
        this.inDev = true;
        this.subcommands = null;

        this.setName("server_config")
        this.setDescription("leave blank to reset to default server")

        //add string options
        const ipOption = new SlashCommandStringOption()
        .setName("ip")
        .setDescription("server IPv4 address")

        const portOption = new SlashCommandStringOption()
        .setName("port")
        .setDescription("pavlovserver port")

        this.addStringOption(ipOption)
        this.addStringOption(portOption)
    }

    override async executeCommand(i: ChatInputCommandInteraction, bot: RCONBot)
    {
        const ipOption = i.options.get("ip")?.value as string | undefined
        const portOption = i.options.get("port")?.value as string | undefined
        
        if(!RCONBot.isAdmin(i.user.id))
        {
            i.reply("You must be an admin to run this")
            return;
        }

        if(!ipOption || !portOption)
        {
            if(!process.env.IP || !process.env.PORT || !process.env.SERVER_PASS)
            {
                i.reply({ephemeral: true, content: "Default server is not set."})
            }
            else 
            {
                bot.tcpClient = new PavTCPClient(process.env.IP, parseInt(process.env.PORT))
                //connect function hashes for us
                bot.tcpClient.connect(process.env.SERVER_PASS)
                i.reply({embeds: [new SuccessEmbed(process.env.IP, process.env.PORT)], ephemeral: true})
            }
        }
        else
        {
            bot.tcpClient = new PavTCPClient(ipOption, parseInt(portOption))
            i.showModal(new PasswordModal)
            const modalData = await i.awaitModalSubmit({time: 60_000})
            const response = modalData.fields.getTextInputValue("rconPasswordInput");
            modalData.deferUpdate()
            bot.tcpClient.connect(response)
            i.followUp({embeds: [new SuccessEmbed(ipOption, portOption)], ephemeral: true})
        }
    }
}