import { EmbedBuilder } from "discord.js";

export default class RCONReplyEmbed extends EmbedBuilder
{
    constructor(response: RCONResponse)
    {
        super()
        if(response.successful)
        {
            this.setColor("Green")
            this.setTitle("Success")
        }
        else
        {
            this.setColor("Red")
            this.setTitle("Failed")
        }

        this.addFields({name: response.command, value: "null"})
    }
}