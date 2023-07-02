import { Socket } from "node:net"
import crypto from "node:crypto"
import { TimerOptions } from "node:timers"
export default class PavTCPClient
{
    private ip: string
    private port: number
    public readonly client: Socket
    private queue: string[]
    private queueHandle: NodeJS.Timer | null
    private validresponses: number

    constructor(ip: string, port: number)
    {
        this.ip = ip;
        this.port = port
        this.queue = []

        this.client = new Socket()

        //this will be null until a timer is set
        this.queueHandle = null
        this.validresponses = 0

    }

    async send(cmd: string): Promise<RCONResponse>
    {

        //make sure there is not a pending identical command
        // if(this.queue.includes(cmd))
        // {
        //     const reply: RCONResponse = {command: cmd, successful: false, description: `There is already a pending **${cmd}** command. Please wait a few seconds.`}
        //     return reply
        // }

        this.queue.push(cmd)

        //initialize interval if invalid
        if(this.queueHandle == null)
        {
            this.queueHandle = setInterval(this.write, 0, this)
        }

        return new Promise<RCONResponse>((resolve) => 
        {
            //set timeout interval in case proper response is never recieved
            const timeoutHanlde = setTimeout(() => 
            {
                resolve({command: cmd, successful: false, description: "Request Timed out"})
            }, 5000)

            this.client.removeAllListeners("data")

            this.client.on("data", (chunk) => 
            {
                let data
                try
                {
                    data = JSON.parse(chunk.toString())
                }
                catch
                {
                    return;
                    //ignore invalid json
                }

                //check if the base command matches
                const baseCmd = cmd.replace(/ .*/,'');
                baseCmd.trim()
                if(data["Command"].toLowerCase() != baseCmd.toLowerCase())
                {
                    //base command did not match
                    return;
                }

                //if there's a unique ID, check to make sure the unique ID matches
                if(cmd.replace(baseCmd, "").trim() && Object.hasOwn(data, "UniqueID"))
                {
                    //there is a unique ID
                    let parameter = cmd.replace(baseCmd, "")
                    parameter.trim()
                    parameter = parameter.trim()
                    if(data["UniqueID"]?.toLowerCase() != parameter.toLowerCase())
                    {
                        //unique id did not match
                        return;
                    }
                }

                this.validresponses ++
                console.log(this.validresponses)
                
                clearTimeout(timeoutHanlde)
                //at this point the base cmd and unique ID match, so its good
                resolve({command: cmd, successful: true, description: "The custom command executed successfully", rawOutput: chunk.toString()})
                
            })
        })

    }

    setIP(ip: string)
    {
        this.ip = ip;
    }

    setPort(port: number)
    {
        this.port = port;
    }

    connect(password: string)
    {
        const hasher = crypto.createHash("md5")
        const hashedPswd = hasher.update(password).digest("hex")
        if(!this.ip || !this.port) return;
        this.client.connect({port: this.port, host: this.ip}, () => 
        {
            this.client.write(hashedPswd);
        })
    }

    private write(tcpCli: PavTCPClient)
    {
        if(!tcpCli.queue.length)
        {
            clearInterval(tcpCli.queueHandle!)
            tcpCli.queueHandle = null;
            return;
        }

        const str = tcpCli.queue.shift()!

        tcpCli.client.write(str)
    }
    
}