// The clinic services I am using for the portal. This is made-up data for the project.
// The nurse names, times and phone numbers are not real.

export const categories = [
  { id: "checkup", name: "General check-ups" },
  { id: "child", name: "Child health" },
  { id: "chronic", name: "Blood pressure and sugar" },
  { id: "vaccine", name: "Vaccinations" },
];

export const branches = ["Scottsville", "Edendale", "Imbali"];

// the phone number of each branch (the same ones as on the home page)
export const branchPhones = {
  Scottsville: "033 000 0000",
  Edendale: "033 000 0001",
  Imbali: "033 000 0002",
};

// The urgency choices from my services wireframe.
// Only "routine" lets you book online. The other two tell you what to do instead.
export const urgencyChoices = [
  { id: "routine", label: "Not urgent, I can book a visit" },
  { id: "today", label: "I need to be seen today, I will phone the branch" },
  { id: "emergency", label: "Emergency, I will call 10177 or 112" },
];

// Each service has:
//  - times: the times the nurse sees people for this service (any open day)
//  - nextFreeDay and nextFreeTime: the next free time, shown on the service card
//  - sameDay: true if the branch can fit you in today when you phone first
export const services = [
  {
    id: 1,
    name: "General check-up",
    category: "checkup",
    branch: "Imbali",
    nurse: "Sister Zulu",
    nextFreeDay: "Monday",
    nextFreeTime: "08:30",
    times: ["08:30", "09:30", "10:30", "13:00", "14:30"],
    sameDay: true,
    description: "A general visit to talk to a nurse about how you are feeling.",
  },
  {
    id: 2,
    name: "Wellness check-up",
    category: "checkup",
    branch: "Scottsville",
    nurse: "Sister Ngcobo",
    nextFreeDay: "Tuesday",
    nextFreeTime: "10:00",
    times: ["08:00", "10:00", "11:00", "14:00"],
    sameDay: false,
    description: "Weight, blood pressure and a chat about staying healthy.",
  },
  {
    id: 3,
    name: "Baby clinic",
    category: "child",
    branch: "Edendale",
    nurse: "Sister Dlamini",
    nextFreeDay: "Monday",
    nextFreeTime: "09:15",
    times: ["08:00", "09:15", "10:30", "11:45"],
    sameDay: true,
    description: "Weighing, growth checks and advice for new mothers.",
  },
  {
    id: 4,
    name: "Child health check",
    category: "child",
    branch: "Scottsville",
    nurse: "Sister Cele",
    nextFreeDay: "Wednesday",
    nextFreeTime: "11:30",
    times: ["09:00", "11:30", "13:30", "15:00"],
    sameDay: false,
    description: "A check-up for children from one to twelve years old.",
  },
  {
    id: 5,
    name: "Blood pressure check",
    category: "chronic",
    branch: "Scottsville",
    nurse: "Sister Khumalo",
    nextFreeDay: "Monday",
    nextFreeTime: "08:00",
    times: ["08:00", "08:30", "09:00", "11:00", "14:00"],
    sameDay: true,
    description: "A nurse checks your blood pressure and talks to you about the results.",
  },
  {
    id: 6,
    name: "Sugar check",
    category: "chronic",
    branch: "Edendale",
    nurse: "Sister Mthembu",
    nextFreeDay: "Thursday",
    nextFreeTime: "08:45",
    times: ["07:45", "08:45", "10:00", "13:15"],
    sameDay: true,
    description: "A finger-prick test for sugar, with advice on food and medicine.",
  },
  {
    id: 7,
    name: "Flu vaccination",
    category: "vaccine",
    branch: "Scottsville",
    nurse: "Sister Zondi",
    nextFreeDay: "Friday",
    nextFreeTime: "09:00",
    times: ["09:00", "09:30", "10:00", "12:00", "15:00"],
    sameDay: false,
    description: "A quick flu injection before winter.",
  },
  {
    id: 8,
    name: "Child vaccinations",
    category: "vaccine",
    branch: "Imbali",
    nurse: "Sister Shange",
    nextFreeDay: "Tuesday",
    nextFreeTime: "13:00",
    times: ["08:30", "10:00", "13:00", "14:30"],
    sameDay: false,
    description: "Baby and child injections, as on the Road to Health card.",
  },
];
