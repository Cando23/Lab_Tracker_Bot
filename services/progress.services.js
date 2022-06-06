const Activity = require("../models/activity");
const { progressOptions } = require("../utils/options");
const Chart = require("quickchart-js");
async function getActivities(period) {
  const day = new Date().getDate();
  const month = new Date().getMonth();
  switch (period) {
    case "Day": {
      return Activity.findAll({ where: { day: `${day}`, month: `${month}` } });
    }
    case "Month": {
      return Activity.findAll({ where: { month: `${month}` } });
    }
    case "Term": {
      return Activity.findAll();
    }
  }
  return stats;
}
async function sendActivies(chatId, bot, period) {
  const activities = await getActivities(period);
  const subjects = activities.map((activity) => activity.subject);
  if (subjects.length) {
    const amounts = activities.map((activity) => activity.amount);
    const image = createDiagram(period, subjects, amounts);
    console.log(image);
    return bot.sendPhoto(chatId, image);
  }
  return bot.sendMessage(
    chatId,
    "Чтобы посмотреть статистику, нужно делать лабы😁\nК сожалению вы не сделали ни одной🙁\n- Попробуйте отметить выполненные лабы /labs\n- Затем снова вызвать /progress"
  );
}
function createDiagram(period, subjects, amounts) {
  const myChart = new Chart();
  myChart.setConfig({
    type: "pie",
    data: {
      labels: subjects,
      datasets: [{ label: period, data: amounts }],
    },
  });
  return myChart.getUrl();
}
async function activityProgress(chatId, user, bot){
    const subjects = await user.getSubjects();
    const total = subjects
      .map((subject) => subject.lab.total)
      .reduce((sum, next) => sum + next);
    const current = subjects
      .map((subject) => subject.lab.current)
      .reduce((sum, next) => sum + next);
    return bot.sendMessage(
      chatId,
      `Уже выполнено лаб: ${
        total - current
      }/${total}\nПросмотреть статистику выполнения за период:`,
      progressOptions
    );
}
module.exports = { sendActivies, activityProgress };
