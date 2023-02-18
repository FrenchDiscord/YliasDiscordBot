import { Constants, Message, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { Listener } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';
import Emojis from '#lib/Emojis';
import { Emotion, Emotions } from '#lib/Emotion';

type GuildTextChannel = TextChannel | ThreadChannel | NewsChannel;

export default class MessageCreate extends Listener<typeof Constants.Events.MESSAGE_CREATE> {
    constructor(context: PieceContext) {
        super(context, {
            event: Constants.Events.MESSAGE_CREATE,
        });
    }

    public run(message: Message): void {
        this.handleBotMention(message);
        this.handleMomMention(message);
    }

    private handleBotMention(message: Message): void {
        if (!message.mentions.users.has(message.client.user!.id)) {
            return;
        }

        const embed = Emotion.getEmotionEmbed(Emotions.NEUTRAL).setTitle('Pinged');

        message.reply({
            embeds: [embed.setDescription(`Hello there! It's me, a bot! If you want me to do something for you, you must use my slash commands! Type a slash (/) in the message bar to get a list of them!`)],
        });
    }

    private handleMomMention(message: Message): void {
        const pingsMom = message.mentions.users.has(process.env.MOM as string);

        if (!message.guild || message.author?.id === process.env.MOM || pingsMom) {
            return;
        }

        const mom = message.client.users.cache.get(process.env.MOM as string)!;
        const momMember = message.guild.members.cache.get(mom.id);
        const cancelWords = ['lildami', 'wolfy', 'lille'];
        const searchWords = [
            mom.id,
            mom.username,
            'leel',
            'lil',
            'lyl',
            'liily',
            'lielie',
            'l¡ly',
            'wolf',
            `${Emojis.l}${Emojis.i}${Emojis.l}${Emojis.y}`,
            `${Emojis.l} ${Emojis.i} ${Emojis.l} ${Emojis.y}`,
        ];

        if (momMember && momMember.nickname) {
            searchWords.push(momMember.nickname);
        }

        for (const cancelWord of cancelWords) {
            if (message.content.toLowerCase().includes(cancelWord)) {
                return;
            }
        }

        let found = false;

        for (const searchWord of searchWords) {
            found = found || message.content.toLowerCase().includes(searchWord);
        }

        if (found) {
            const channel = message.channel as GuildTextChannel;
            const embed = Emotion.getEmotionEmbed(Emotions.WINK)
                .setURL(message.url)
                .setAuthor(message.member!.displayName, message.author.displayAvatarURL({ dynamic: true }), message.url)
                .setDescription(message.content)
                .setFooter(`#${channel.name} in ${message.guild.name}`);

            mom.send({ embeds: [embed] });
        }
    }
}
