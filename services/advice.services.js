function getNumberOfDays(start, end) {
  const oneDay = 1000 * 60 * 60 * 24;
  const diffInTime = start - end;
  const diffInDays = Math.round(diffInTime / oneDay);
  return diffInDays;
}
async function advice(user) {
  const subjects = await user.getSubjects();
  const sum = subjects
    .map((subject) => subject.lab.current)
    .reduce((sum, amount) => sum + amount);
  const end = user.dateEnd.split(".").reverse();
  const date = new Date(Date.UTC(end[0], end[1] - 1, end[2]));
  const days = getNumberOfDays(date.getTime(), Date.now());
  const weeks = Math.ceil(days / 7);
  const dayReponse = `Дней - ${days}\n`;
  const weekResponse = `Недель - ${weeks}\n`;
  const labResponse = `Лаб - ${sum}\n`;

  return `У вас осталось до конца семестра:\n${dayReponse}${weekResponse}${labResponse}\nНужно делать лабы:\nКаждый день - ${(
    sum / days
  ).toFixed(2)}\nКаждую неделю - ${(sum / weeks).toFixed(2)}\n`;
}

module.exports = advice;
