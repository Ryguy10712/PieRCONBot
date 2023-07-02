import { Client } from "discord.js";
import { RCONBot } from "../Bot";

export default abstract class EventListener
{
    abstract startListener(bot: RCONBot): void
}