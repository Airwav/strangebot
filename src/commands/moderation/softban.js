const { ApplicationCommandOptionType } = require("discord.js");
const { softbanTarget } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "softban",
  description: "softban the specified member. Kicks and deletes messages",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for softban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await softban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await softban(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function softban(issuer, target, reason) {
  const response = await softbanTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.tag} is soft-banned!`;
  if (response === "BOT_PERM") return `I do not have permission to softban ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to softban ${target.user.tag}`;
  else return `Failed to softban ${target.user.tag}`;
}
