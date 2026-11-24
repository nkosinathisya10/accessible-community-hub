// Functions that check the booking form. I put them in their own file so
// the form component does not get too long and they are easy to test.

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Turns a date into text like 2026-10-19 (the format a date input uses).
// I used the local date on purpose, because toISOString() can give the wrong day.
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Turns "2026-10-19" back into a Date (at midnight, local time)
function readDate(text) {
  const parts = text.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Turns "2026-10-19" into "Monday 19 October 2026", which is easier to hear
// with a screen reader than a row of numbers.
export function showDate(text) {
  if (!text) return "";
  const date = readDate(text);
  return dayNames[date.getDay()] + " " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

// Gives back the next date (from tomorrow on) that falls on the day name,
// for example the next "Monday". I use it to fill in the next free time.
export function nextDateFor(dayName) {
  const date = new Date();
  const wanted = dayNames.indexOf(dayName);
  const daysToAdd = (wanted - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysToAdd);
  return formatDate(date);
}

// Checks one field and gives back an error message.
// If the field is fine it gives back an empty string.
// allValues is the whole form, because the time check needs to know the date.
export function checkField(name, value, allValues = {}) {
  if (name === "service") {
    if (value === "") return "Please choose a service.";
  }

  if (name === "branch") {
    if (value === "") return "Please choose a branch.";
  }

  if (name === "visitDate") {
    if (value === "") return "Please choose a date.";

    const chosen = readDate(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (chosen < today) return "Please choose today or a date in the future.";
    if (chosen.getDay() === 0) return "The clinic is closed on Sundays. Please pick another day.";
  }

  if (name === "visitTime") {
    if (!allValues.service) return "Please choose a service first, then a time.";
    if (value === "") return "Please choose a time.";

    // if the visit is today, the time must not have gone past already
    if (allValues.visitDate === formatDate(new Date())) {
      const now = new Date();
      const nowText = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      // "08:30" < "14:00" works because both are written the same way
      if (value <= nowText) return "That time has already gone past today. Please pick a later time.";
    }
  }

  if (name === "fullName") {
    const trimmed = value.trim();
    if (trimmed === "") return "Please type your full name.";
    if (!trimmed.includes(" ")) return "Please type your name and your surname.";
  }

  if (name === "cellNumber") {
    // take out any spaces first, so 082 123 4567 also works
    const digits = value.replace(/\s/g, "");
    if (digits === "") return "Please type your cell number.";
    if (!/^0\d{9}$/.test(digits)) {
      return "Your cell number must be 10 digits and start with 0, for example 0821234567.";
    }
  }

  return "";
}

// The fields that must be checked, in the same order they show on the page.
export const fieldOrder = ["service", "branch", "visitDate", "visitTime", "fullName", "cellNumber"];

// Checks every field and gives back an object of errors, like { fullName: "..." }
export function checkAll(values) {
  const errors = {};
  fieldOrder.forEach((name) => {
    errors[name] = checkField(name, values[name], values);
  });
  return errors;
}
