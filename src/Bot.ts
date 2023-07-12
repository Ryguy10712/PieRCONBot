import { Client, REST, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from "discord.js"
import dotenv from "dotenv"
import ReadyListener from "./discord/listeners/ReadyListener"
import Command from "./discord/Command"
import ResetSNDCmd from "./discord/commands/ResetSND"
import PavTCPClient from "./tcpClient/tcpClient"
import CustomCmd from "./discord/commands/Custom"
import InteractionCreateListener from "./discord/listeners/InteractionCreateListener"
import { SwitchMapCmd } from "./discord/commands/SwitchMap"
import { WhitelistCmdCmd } from "./discord/commands/WhitelistCommandCmd"
import { KickCmd } from "./discord/commands/Kick"
import { BanCmd } from "./discord/commands/Ban"
import { UnbanCmd } from "./discord/commands/Unban"
import { AddModCmd } from "./discord/commands/AddMod"
import { RemoveModCd as RemoveModCmd } from "./discord/commands/RemoveMod"
import { ServerCfgCmd } from "./discord/commands/ServerConfig"

//initialize environment vars
dotenv.config()

//overarching bot class
export class RCONBot 
{
    public readonly client: Client
    public readonly commands: Map<string, Command>
    public tcpClient: PavTCPClient

    constructor()
    {
        this.tcpClient = new PavTCPClient(process.env.IP!, parseInt(process.env.PORT!));

        this.tcpClient.connect(process.env.SERVER_PASS!)

        this.client = new Client({
            intents: ["GuildMembers", "Guilds"]
        })

        this.commands = new Map<string, Command>
        this.initCommand(new ResetSNDCmd);
        this.initCommand(new CustomCmd());
        this.initCommand(new SwitchMapCmd());
        this.initCommand(new KickCmd());
        this.initCommand(new BanCmd());
        this.initCommand(new UnbanCmd());
        this.initCommand(new AddModCmd());
        this.initCommand(new RemoveModCmd);
        this.initCommand(new ServerCfgCmd());
        this.initCommand(new WhitelistCmdCmd(this)) // initialize this LAST!!

        new ReadyListener().startListener(this);
        new InteractionCreateListener().startListener(this)

    }

   
     //logon script and command deployment
    public async start(): Promise<void> 
    {
        await this.client.login(process.env.TOKEN)
        this.deployCmds();

        process.on("uncaughtException", (e) => {
            //log error in discord channel of choice
            console.error(e)
        })
    }

    private initCommand(cmd: Command)
    {
        if(!cmd.name)
        {
            console.log(`[WARNING] ${cmd.constructor.name} does not have a name and will not be deployed`);
            return;
        }

        this.commands.set(cmd.name, cmd)
    }

    private async deployCmds()
    {
        const rest = new REST().setToken(process.env.TOKEN!)
        const auth = {"Authorization": `Bot ${process.env.TOKEN}`}
        const cmdBody: RESTPostAPIApplicationCommandsJSONBody[] = []
        const inDevBody: RESTPostAPIApplicationGuildCommandsJSONBody[] = [] //not globalized for faster deployment

        //sort comamnds into their JSON information
        for(const cmd of this.commands.values())
        {
            if(cmd.inDev)
            {
                inDevBody.push(cmd.toJSON())
            }
            else
            {
                cmdBody.push(cmd.toJSON())
            }
        }

        //check to make sure the arrays are populated and push them out respectively
        try
        {
            if(inDevBody.length >= 1)
            {
                await rest.put(
                    Routes.applicationGuildCommands(this.client.application!.id, process.env.TESTING_GUILD_ID!),
                    {headers: auth, body: inDevBody}
                )
            }

            if(cmdBody.length >= 1)
            {
                await rest.put(
                    Routes.applicationCommands(this.client.application?.id!),
                    {body: cmdBody}
                )
            }
        }
        catch (e)
        {
            console.error(e)
        }
       
    }

    public static isAdmin(userID: string): boolean
    {
        const admins = ["758816397399949343", "429332103952465920", "325401870518714369"]
        if(admins.includes(userID)) return true;
        else return false;
    }

}



try {
    new RCONBot().start()
} catch(e) {
    console.error(e)
}
