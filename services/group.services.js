const { getAcronyms, getGroups, getGroupInfo } = require("../utils/api");
const { forceOptions } = require("../utils/options");
const Subject = require("../models/subject");
const Activity = require("../models/activity");
async function getLabs(chatId, user, bot) {
  const subjects = await user.getSubjects();
  const acronyms = subjects.map((subject) => [subject.acronym]);
  return bot.sendMessage(
    chatId,
    `${subjects
      .map((subject) => [subject.acronym, subject.lab.current].join(" - "))
      .join("\n")}`,
    {
      reply_markup: {
        keyboard: [...acronyms, [{ text: "Убрать клавиатуру" }]],
      },
    }
  );
}
async function updateSubjects(user) {
  try {
    const groupInfo = await getGroupInfo(user.group);
    if (!groupInfo) throw new Error("Empty server response");
    user.dateEnd = groupInfo["dateEnd"];
    const acronyms = getAcronyms(groupInfo);
    const subjects = await user.getSubjects();

    subjects.forEach((subject) => subject.lab.destroy());
    acronyms.forEach(async (name) => {
      const [subject] = await Subject.findOrCreate({
        where: {
          acronym: name,
        },
      });
      user.addSubject(subject, { through: { total: 0, current: 0 } });
    });
    await Activity.destroy({
      where: {
        userId: user.id,
      },
    });
    await user.save();
    return true;
  } catch (e) {
    throw e;
  }
}
async function setGroup(chatId, user, bot) {
  const { message_id } = await bot.sendMessage(
    chatId,
    `Пожалуйста, введите номер вашей группы`,
    forceOptions
  );
  bot.onReplyToMessage(chatId, message_id, async (message) => {
    const group = message.text;
    let isExists = false;
    const groupList = await getGroups();
    const groups = new Set(groupList);
    if (group) isExists = groups.has(group);
    if (isExists) {
      try {
        await user.update({ group: `${group}` });
        await clearActivities(user.id);
        bot.sendMessage(
          chatId,
          `Ваша группа ${group}.\nТеперь установим общее количество лабораторных /configure`
        );
        await updateSubjects(user);
      } catch (e) {
        throw e;
      }
    } else
      bot.sendMessage(
        chatId,
        `Группа ${group} не найдена.\nПопробуйте снова /group.`
      );
  });
}
async function clearActivities(id) {
  return Activity.destroy({
    where: {
      userId: id,
    },
  });
}
module.exports = { setGroup, updateSubjects, getLabs };
