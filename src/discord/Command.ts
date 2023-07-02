import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { RCONBot } from "../Bot";

export default abstract class Command extends SlashCommandBuilder {
    public abstract subcommands: Command[] | null
    public abstract inDev: boolean

    public async executeCommand(interaction: ChatInputCommandInteraction, bot: RCONBot)
    {
        interaction.reply({ephemeral: true, content: "This command has no implementation"});
    }
}