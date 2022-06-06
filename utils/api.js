require("dotenv").config();
const fetch = require("node-fetch");
const ignoredSubjects = new Set(["ФизК", "КЧ", "СпецП"]);
async function getGroupInfo(group) {
  try {
    const response = await fetch(`${process.env.SCHEDULE_API}${group}`);
    const responseJson = await response.json();
    return responseJson;
  } catch {
    return {};
  }
}
function getAcronyms(groupInfo) {
  const schedules = groupInfo["schedules"];
  let subjects = new Set();
  schedules.forEach((schedule) => {
    schedule["schedule"].forEach((subject) => {
      if (!ignoredSubjects.has(subject["subject"])) {
        subjects.add(subject["subject"]);
      }
    });
  });
  return [...subjects];
}
async function getGroups() {
  try {
    const response = await fetch(`${process.env.GROUPS_API}`);
    const responseJson = await response.json();
    return responseJson.map((group) => group["name"]);
  } catch {
    return [];
  }
}
module.exports = { getAcronyms, getGroups, getGroupInfo };
