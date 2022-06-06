module.exports = {
  forceOptions: {
    reply_markup: {
      force_reply: true,
    },
  },
  progressOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Сегодня", callback_data: "Day" }],
        [{ text: "Месяц", callback_data: "Month" }],
        [{ text: "Семестр", callback_data: "Term" }],
      ],
    }),
  },
  groupOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Да", callback_data: "Group" }]],
    }),
  },
};
