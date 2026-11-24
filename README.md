# Midlands Community Clinic Booking Portal

This is a booking website for a made-up clinic in Pietermaritzburg. I built it as a student project for ticket MD-2026-0143 from Marlowe Digital. The council wants a working prototype that people who use a screen reader, or only a keyboard, can use properly.

The clinic is not real. The branches (Scottsville, Edendale and Imbali), the nurses, the times and the phone numbers are all made up.

## What is in this repo

- wireframes: Part A. Three plain HTML pages, one CSS file, the persona and the WCAG matrix.
- src: Part B. The React app and its tests.
- test-results: my Lighthouse screenshots and my manual testing log.
- netlify.toml: the settings for putting the site online.
- README.md: this file. It also has the Part C write-up.

## How to run it
Clone the repository to your local machine and then open your terminal and go to the root folder similar to below:
```bash
nkosi@LAPTOP-5STUIT13 MINGW64 ~/OneDrive/Documents/capstone4/accessible-community-hub (main)
```
And then run these commands one at a time:

```bash
npm install
npm run dev
```

To run the tests or make the final version of the site (these tests must also run in the root folder):

```bash
npm test
npm run build
```

## Part A: Wireframes and planning

- Three pages made with plain HTML and CSS, with no JavaScript: a home page, a page to find a service, and a booking page. Each page uses header, nav, main, section, article, aside and footer.
- The persona is Thandeka. She is blind and uses NVDA with Chrome on a Windows laptop. The persona file says what goes wrong for her on normal websites.
- Every text colour is at least 4.5 to 1 against every background it sits on (the page, the white cards, the header, the footer, the buttons and the notice). Every focus ring and border is at least 3 to 1. All the numbers are in the comments at the top of main.css.
- The WCAG matrix has 8 rules. For each one it says where it applies, how I build it, how I check it and what I found.

## Part B: The React app

- A booking form. Every field has a label and help text. Mistakes are shown in words under the field, and a screen reader reads them out.
- An appointment time. After you choose a service, its times show as a group of radio buttons. If you came from a service card, the next free date and time on the card are filled in for you, and you can change them.
- A list of clinic services that you can search and filter. The Filters button says if it is open or closed, and the type buttons say if they are switched on.
- A "How urgent is it?" choice, the same as in the wireframe. "Not urgent" shows every service. "I need to be seen today" shows only the services that can fit you in today, with the branch phone number. "Emergency" hides the list and tells you to call 10177 or 112.
- A booking popup that shows the service, branch, nurse, date and time you chose.
- Keyboard use: a skip link, a clear focus ring, focus that moves to the page heading when the page changes, and a booking popup that you can close with Escape. After "Find another service", focus goes to the heading of the services page.
- 59 tests, including accessibility checks with axe.

The code is in src. The components are in src/components, the services list is in src/data, and the form checking rules are in src/utils.

## Part C: My accessibility decisions

### 1. Three trade-offs

Keeping Tab inside the popup. After a booking, a popup shows the details. If Tab could leave it, a keyboard user would end up in the page behind it, which they can not see. So Tab goes round inside the popup, and the page behind is switched off with inert. A trap can lock someone in, so Escape always closes it and there is a Close button. Focus then goes back to "Book my visit", or to the services heading after "Find another service", because that button is gone by then.

Speaking too much or too little. The results count and the field errors are polite, so they wait for the screen reader to finish talking. Only the message after pressing Book my visit ("There are 2 problems") is assertive. The cost is that the count changes on every letter typed. I did not add a delay, to keep the code simple.

Normal controls or fancy ones. I used the browser's own select boxes, date picker, checkboxes and radio buttons. The appointment times and the urgency choice are radio buttons, so the arrow keys and "1 of 4" come for free. The cost is that they look a bit different in each browser. Working properly matters more to me than looking the same.

### 2. How React state and the accessibility attributes stay in step

Every accessibility value comes from a state variable in the same render, so what a screen reader hears can not get out of step with the screen.

- The filters-open state sets aria-expanded on the Filters button.
- The chosen-types list sets aria-pressed on each type button.
- The errors state sets aria-invalid, adds the error to aria-describedby, and fills a polite live region. For the times, these go on the whole radio group.
- The urgency state picks which services show and fills the polite status line.
- The chosen service decides which times show. Changing the service clears a time it does not have.
- The current page sets aria-current and the page title.

I move focus with useRef: to the new page heading, to the first wrong field, and into the popup. It goes back in a useEffect cleanup, but only if that element is still on the page.

### 3. Testing and checking

Automated:

- 59 tests with Vitest and Testing Library, with axe checks on every page, on the form with errors, on the urgency messages and on the popup. axe found no problems.
- Lighthouse accessibility (11 October, before the times and urgency were added): 100 on all three pages. Screenshots are in test-results.
- I worked out every colour pair by hand (in main.css). This found that the skip link's blue focus ring was too faint on the green header, so I made it yellow.

Manual (NVDA and Chrome, log in test-results/manual-testing-log.md):

- Round 1: NVDA read the page title, the main menu and the current page, and the Filters button as collapsed and expanded.
- Round 2: NVDA read the skip link, each form error with "invalid entry", the times group, the pressed filter buttons, the emergency message and the popup with its date and time. It also showed me two problems: errors read out just from tabbing past empty fields, and a time error repeated for every service. I fixed both and added tests.
- I only tested with NVDA, not TalkBack, VoiceOver or Orca.

## What I would improve

- The page changes with state, not with a router, so the address bar never changes and the browser Back button leaves the app. A router would fix this.
- The search count could wait a moment before it is read out.
- The times are the same on every day. A real system would get the free times for each day from the clinic.
- Test "Find another service" and the arrow keys in the times again with NVDA.
- Run Lighthouse again now that the times and the urgency choice are in.
- Test with more screen readers and with real users.
