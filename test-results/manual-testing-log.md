# Manual Testing Log

I did these tests myself on my own laptop, with the NVDA screen reader and the Chrome browser on Windows. I wrote down what NVDA really said.

- Screen reader: NVDA
- Browser: Chrome
- Site: Midlands Community Clinic Booking Portal

# Round 1 - 12 October 2026

## What I noticed when I first switched NVDA on

- NVDA read out the words on the page as I moved the mouse over them.
- NVDA told me when something could be clicked, like a link or a button.
- When I moved into a form field, NVDA made a different sound to tell me I was in a form I could fill in.
- When I moved onto a dropdown list, NVDA made another different sound.

## Screen reader checks

| What I did | What NVDA said | What this shows |
|---|---|---|
| Clicked on the browser window with the site open | NVDA made a sound and said "Chrome, Midlands Community Clinic, document" | The page title is read out, so I know which site I am on |
| Moved into the main menu | NVDA said it was the main menu, a navigation landmark, and a list with 3 items. It also said "current page" for the page I was on | The menu is marked as navigation, and the current page is announced |
| Pressed Tab to move around the menu | NVDA only said the name of the button I landed on, and the same for each item I tabbed to | Tab moves from one item to the next and each one has a clear name |
| Moved onto the Filters button | NVDA said "Filters", "collapsed" and "heading level 3". After I pressed it, it said "expanded" | The Filters button tells the screen reader if it is open or closed, and it is a proper heading |

## Keyboard tab order

When I used the Tab key, the focus moved from one button to the next, and NVDA said the name of each one as I got to it.

# Round 2 - 24 November 2026

In this round I tested the parts I did not test in Round 1, and the new parts (the appointment times, the urgency choice and the booking popup). I used the keyboard only, with NVDA's Speech Viewer open so I could copy exactly what NVDA said.

## A. Skip link (Home page)

| What I did | What NVDA said | Did it work? |
|---|---|---|
| Opened the site in a new tab and pressed Tab | "Find a service, button", then "Skip to main content, visited, same page, link". The white "Skip to main content" box showed top-left with the yellow focus ring | Yes, see the note below |
| Pressed Enter on the skip link | "main landmark", then it read the main part from "Sawubona! Book your clinic visit online, heading level 1" down to the branches | Yes, focus jumped past the menu |
| Pressed Tab | "Sawubona! Book your clinic visit online, region, Book a visit, button" | Yes, it landed on the first button in the main part |

Note: in my first tries, after I had clicked on the page and reloaded it, pressing Tab went to the menu buttons and I did not see the skip link box. When I opened the site in a new tab it worked. I think Chrome starts Tab from the place I was last on the page.

## B. Booking form errors and the times (Book a visit page)

| What I did | What NVDA said | Did it work? |
|---|---|---|
| Tabbed through the empty form | "Service, combo box, Choose a service, collapsed, required, The service you want to book." Then Branch, the date ("date edit, required" and then Month, Day and Year spin buttons and "Show date picker"), "Full name, edit, required", "Cell number, edit, required", "Reason for the visit (optional), edit, multi line", "Reminder, grouping, Please SMS me a reminder the day before, check box, checked", "Book my visit, button" | Yes, every field has a name, "required" and its help text. But see problem 1 |
| Pressed Enter on "Book my visit" with the form empty | "There are 6 problems with the form. Please fix the errors and try again." Then focus went to "Service, combo box, Choose a service, collapsed, required, invalid entry, The service you want to book. Error: Please choose a service." | Yes |
| Tabbed through the fields again | "Branch, combo box, ... invalid entry ... Error: Please choose a branch." and "Date you would like to come, date edit, required, invalid entry ... Error: Please choose a date." | Yes, each field says "invalid entry" and reads its error |
| Shift+Tab back to Service, chose Blood pressure check with the Down arrow | It read each service as I passed it, and "Error: Please choose a time." and "Error: Please choose a service first, then a time." came up again and again | The service changed, but see problem 2 |
| Tabbed to the times | "Time you would like to come, grouping, required, invalid entry, These are the times for the service you chose. Error: Please choose a time." then "08:00, radio button, not checked, 1 of 5" | Yes, the group has a name and says it is required and invalid |
| Pressed the Right arrow | "Back" | No, the time did not change. I think NVDA was not in focus mode. I did not test this again (see "What I did not test") |

## C. Search, urgency and the filter buttons (Find a service page)

| What I did | What NVDA said | Did it work? |
|---|---|---|
| Tabbed to the search box | "Search services, search landmark, Search for a service, edit, For example: blood pressure, vaccination, baby. The list updates as you type." | Yes |
| Typed "baby" | "6 services found" after the "b", then "2 services found" after "ba" | Yes. It reads the count after each letter, which I already wrote about in the README |
| Tabbed to the urgency choice | "How urgent is it?, grouping, Not urgent, I can book a visit, radio button, checked, 1 of 3" | Yes |
| Pressed the Down arrow | "1 service found that can see you today" and "I need to be seen today, I will phone the branch, radio button, checked, 2 of 3" | Yes, the arrow keys work here |
| Pressed the Down arrow again | "Emergency chosen. Do not book online. Call 10177 or 112." and "Emergency, I will call 10177 or 112, radio button, checked, 3 of 3" | Yes, the emergency message is read out straight away |
| Pressed the Up arrow twice | "1 service found that can see you today", then "2 services found" and "Not urgent, I can book a visit, radio button, checked, 1 of 3" | Yes |
| Tabbed to Filters and pressed Enter | "Filters, button, collapsed, heading level 3", then "expanded" | Yes |
| Tabbed to Child health | "Filters, grouping, Type of service, grouping, General check-ups, toggle button, not pressed", then "Child health, toggle button, not pressed" | Yes |
| Pressed Space on Child health | "1 service found", "pressed" | Yes |
| Pressed Space again | "2 services found", "not pressed" | Yes |

## D. Booking popup

| What I did | What NVDA said | Did it work? |
|---|---|---|
| On Find a service, tabbed to "Book Sugar check" and pressed Enter | "Book a visit, heading level 1". Then on the form: "Service, combo box, Sugar check", "Branch, combo box, Edendale", the date as Month 11, Day 26, Year 2026, and "Time you would like to come, grouping, required ... 08:45, radio button, checked, 2 of 4" | Yes, the next free time from the card was filled in |
| Typed my name and cell number and pressed Enter on "Book my visit" | "Your visit is booked, dialog, Your visit is booked, heading level 2", then the details: "Service, Sugar check, Branch, Edendale, Nurse on duty, Sister Mthembu, Date, Thursday 26 November 2026, Time, 08:45, Name, Thandeka Mkhize, Cell number, 0821234567", then "Please arrive 10 minutes early and bring your ID or clinic card." | Yes, the popup is read out with the date and the time |
| Pressed Tab 3 times | "Close, button", "Find another service, button", "Close, button" | Yes, Tab stays inside the popup |
| Pressed Escape | The popup closed and NVDA said "Book my visit" | Yes, focus went back to the button |

## Problems I found

1. Tabbing past an empty field showed an error. When I tabbed through the empty form without typing anything, NVDA read "Error: Please choose a service", "Error: Please choose a branch" and so on for every field. For a screen reader user this is a lot of noise before they have even started. **Fixed:** leaving an empty field no longer shows an error. Empty fields are still checked when you press "Book my visit". I added a test for this.
2. The time error was read out again and again. When I moved through the services with the arrow keys, NVDA read "Error: Please choose a time" and "Error: Please choose a service first, then a time" for every service I passed. **Fixed:** changing the service now takes the old time error away, and the time is checked again when you press "Book my visit". I added a test for this.
3. The arrow key in the times said "Back". I am not sure if this was NVDA's mode or a problem. The arrow keys worked in the urgency choice, which uses the same kind of radio buttons, and an automated test checks the arrow keys in the times.

## What I did not test

- "Find another service" with NVDA. An automated test checks that focus goes to the "Find a clinic service" heading.
- The arrow keys in the times, again, after problem 3.
- I only tested with NVDA and Chrome, not with TalkBack on Android, VoiceOver or Orca.
