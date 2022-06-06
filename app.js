require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const commands = require("./utils/commands");
const { groupOptions } = require("./utils/options");
const {
  setGroup,
  updateSubjects,
  getLabs,
} = require("./services/group.services");
const advice = require("./services/advice.services");
const {
  configure,
  completeLabs,
  configureHandler,
} = require("./services/configure.services");

const sequelize = require("./models/db");

const User = require("./models/user");
const Subject = require("./models/subject");
const Lab = require("./models/lab");
const Activity = require("./models/activity");
const {
  sendActivies,
  activityProgress,
} = require("./services/progress.services");

User.belongsToMany(Subject, { through: Lab });
User.hasMany(Activity);
Subject.belongsToMany(User, { through: Lab });

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

start();
async function connectToDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log(e);
  }
}

async function start() {
  await connectToDb();
  bot.setMyCommands(commands);
  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const user = await User.findOne({ where: { chatId: `${chatId}` } });
    switch (data) {
      case "Group": {
        return setGroup(chatId, user, bot);
      }
      case "Day": {
        return sendActivies(chatId, bot, data);
      }
      case "Month": {
        return sendActivies(chatId, bot, data);
      }
      case "Term": {
        return sendActivies(chatId, bot, data);
      }
      default: {
        return configureHandler(chatId, user, bot, data);
      }
    }
  });

  bot.on("message", async (msg) => {
    try {
      const text = msg.text;
      const chatId = msg.chat.id;
      switch (text) {
        case "Убрать клавиатуру": {
          return bot.sendMessage(chatId, "Дело сделано🤪", {
            reply_markup: {
              remove_keyboard: true,
            },
          });
        }
        case "/start": {
          const first_name = msg.chat.first_name;
          await User.findOrCreate({ where: { chatId: `${chatId}` } });
          return bot.sendMessage(
            chatId,
            `Привет, ${first_name}, этот бот помогает выполнять лабы.\nВведите /info, чтобы узнать больше об этом боте.`
          );
        }
        case "/progress": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (!user.group) {
            return bot.sendMessage(
              chatId,
              `Сначала установите вашу группу /group🤨`
            );
          }
          return activityProgress(chatId, user, bot);
        }
        case "/info":
          return bot.sendMessage(
            chatId,
            `BSUIR Lab Tracker Bot.\nБот помогает вести учёт выполенных лаб.\nДля того, чтобы отметить выполненные лабы, введите название предмета и их количество.\n\nСписок команд:\n/group - настройка номера вашей группы\n/configure - установка общего количества лаб по каждому предмету\n/labs - просмотр списка лаб по каждому предмету\n/advice - советы по скорости выполнения лаб\n/progress - просмотр прогресса выполнения лаб за месяц и за весь семестр\n/update - обновить список предметов для нового семестра\n`
          );
        case "/update": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (user.group) {
            const result = await updateSubjects(user);
            if (result)
              return bot.sendMessage(
                chatId,
                "Список предметов был обновлен успешно"
              );
            return bot.sendMessage(
              chatId,
              "Что-то пошло не так, попробуйте позже🤯"
            );
          }
        }
        case "/advice": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (!user.group) {
            return bot.sendMessage(
              chatId,
              `Сначала выберите вашу группу /group🤨`
            );
          }

          const response = await advice(user);
          return bot.sendMessage(chatId, response);
        }
        case "/group": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (user.group) {
            return bot.sendMessage(
              chatId,
              `Номер вашей группы ${user.group}, хотите изменить?🤔`,
              groupOptions
            );
          }
          return setGroup(chatId, user, bot);
        }
        case "/configure": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (!user.group) {
            return bot.sendMessage(
              chatId,
              `Сначала выберите вашу группу /group🤨`
            );
          }
          return configure(chatId, user, bot);
        }
        case "/labs": {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          if (!user.group) {
            return bot.sendMessage(
              chatId,
              `Сначала выберите вашу группу /group🤨`
            );
          }
          return getLabs(msg.chat.id, user, bot);
        }
        default: {
          const user = await User.findOne({ where: { chatId: `${chatId}` } });
          return completeLabs(chatId, user, bot, msg.text);
        }
      }
    } catch (e) {
      return bot.sendMessage(chatId, "Что-то пошло не так!🤯");
    }
  });
}
