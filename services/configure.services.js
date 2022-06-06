const Activity = require("../models/activity");
const { forceOptions } = require("../utils/options");
async function configure(chatId, user, bot) {
  let keyboard = [];
  let index = -1;
  const subjects = await user.getSubjects();
  subjects.forEach((subject) => {
    if (!keyboard[index] || keyboard[index].length > 1) {
      index++;
      keyboard[index] = [];
    }
    keyboard[index].push({
      text: subject.acronym,
      callback_data: subject.acronym,
    });
  });

  return bot.sendMessage(chatId, `Выберите предмет`, {
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard,
    }),
  });
}
async function completeLabs(chatId, user, bot, text) {
  const subjects = await user.getSubjects();
  const acronyms = subjects?.map((subject) => subject.acronym);
  const index = acronyms?.indexOf(text);
  if (index !== undefined && index !== -1) {
    const { message_id } = await bot.sendMessage(
      chatId,
      `Сколько сделано лаб по ${text}?`,
      forceOptions
    );
    bot.onReplyToMessage(chatId, message_id, async (message) => {
      const count = Number.parseInt(message.text);
      if (count && count > 0 && count < 10) {
        const current = subjects[index].lab.current;
        if (current && current >= count) {
          await subjects[index].lab.update({
            current: current - count,
          });
          await Activity.create({
            day: new Date().getDate(),
            month: new Date().getMonth(),
            subject: subjects[index].acronym,
            amount: count,
            userId: user.id,
          });
          return bot.sendMessage(
            chatId,
            subjects[index].lab.current === 0
              ? `Поздравляю, по ${subjects[index].acronym} лабы закончились!😃`
              : `По ${subjects[index].acronym} осталось лаб - ${subjects[index].lab.current}`
          );
        }
        return bot.sendMessage(
          chatId,
          `Число сделанных лаб не может быть больше невыполненных!😡`
        );
      } else {
        return bot.sendMessage(chatId, `Неправильное количество лабораторных!😢`);
      }
    });
  }
}

async function configureHandler(chatId, user, bot, text) {
  const subjects = await user.getSubjects();
  const subject = subjects.filter((subject) => {
    if (subject.acronym == text) return subject;
  });

  const { message_id } = await bot.sendMessage(
    chatId,
    subject[0].lab.total !== 0
      ? `Введите новое количество лаб.\nЭто приведет к сбросу статистики!`
      : `Введите количество лабораторных`,
    forceOptions
  );
  bot.onReplyToMessage(chatId, message_id, async (message) => {
    const count = Number.parseInt(message.text);
    if (count && count > 0 && count < 15) {
      if (subject[0].lab.total !== 0) {
        await Activity.destroy({
          where: {
            userId: user.id,
            subject: subject[0].acronym,
          },
        });
      }
      await subject[0].lab.update({ total: count, current: count });
      return bot.sendMessage(
        chatId,
        count === 1
          ? `По предмету ${subject[0].acronym} нужно выполнить ${count} лабу😌`
          : count < 5
          ? `По предмету ${subject[0].acronym} нужно выполнить ${count} лабы😥`
          : `По предмету ${subject[0].acronym} нужно выполнить ${count} лаб😰`
      );
    } else {
      return bot.sendMessage(chatId, `Неправильное количество лабораторных!😢`);
    }
  });
}
module.exports = { configure, completeLabs, configureHandler };
