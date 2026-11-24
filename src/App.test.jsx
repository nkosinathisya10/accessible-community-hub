import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "./App.jsx";
import { formatDate, nextDateFor, showDate } from "./utils/checkForm.js";

function nextMonday() {
  const date = new Date();
  const daysToAdd = (1 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysToAdd);
  return formatDate(date);
}

// finds a button inside the main menu (the home page also has a button with the same name)
function menuButton(name) {
  const menu = screen.getByRole("navigation", { name: /main menu/i });
  return within(menu).getByRole("button", { name });
}

describe("App", () => {
  test("the home page has no accessibility problems", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("the page has a skip link, a main part and a footer", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("the menu marks the current page and changes the page title", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(menuButton(/^home$/i)).toHaveAttribute("aria-current", "page");

    await user.click(menuButton(/find a service/i));

    expect(menuButton(/find a service/i)).toHaveAttribute("aria-current", "page");
    expect(menuButton(/^home$/i)).not.toHaveAttribute("aria-current");
    expect(document.title).toMatch(/find a service/i);
  });

  test("focus moves to the new page heading when the page changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(menuButton(/find a service/i));
    expect(screen.getByRole("heading", { level: 1, name: /find a clinic service/i })).toHaveFocus();

    await user.click(menuButton(/book a visit/i));
    expect(screen.getByRole("heading", { level: 1, name: /book a visit/i })).toHaveFocus();
  });

  test("the services page and the booking page have no accessibility problems", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(menuButton(/find a service/i));
    expect(await axe(container)).toHaveNoViolations();

    await user.click(menuButton(/book a visit/i));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("a whole booking: pick a service, keep the next free time, get the popup, close it", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // pick a service from the list
    await user.click(menuButton(/find a service/i));
    await user.click(screen.getByRole("button", { name: /book sugar check/i }));

    // the form already has the service, branch and the next free time (Thursday 08:45)
    expect(screen.getByLabelText(/^service/i)).toHaveValue("6");
    expect(screen.getByLabelText(/^branch/i)).toHaveValue("Edendale");
    expect(screen.getByLabelText(/date you would like/i)).toHaveValue(nextDateFor("Thursday"));
    expect(screen.getByRole("radio", { name: "08:45" })).toBeChecked();

    await user.type(screen.getByLabelText(/full name/i), "Thandeka Mkhize");
    await user.type(screen.getByLabelText(/cell number/i), "0821234567");

    const bookButton = screen.getByRole("button", { name: /book my visit/i });
    await user.click(bookButton);

    // the popup opens, has focus, and shows the chosen date and time
    const popupHeading = screen.getByRole("heading", { name: /your visit is booked/i });
    expect(popupHeading).toHaveFocus();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(showDate(nextDateFor("Thursday")));
    expect(dialog).toHaveTextContent("08:45");
    expect(await axe(container)).toHaveNoViolations();

    // the page behind it is switched off (a real browser hides "inert" things
    // from the keyboard and the screen reader, jsdom only keeps the attribute)
    expect(screen.getByRole("main").closest("[inert]")).not.toBeNull();

    // Escape closes it and focus goes back to the booking button
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book my visit/i })).toHaveFocus();
  });

  test("a booking from the menu: choose a different time, and it shows in the popup", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(menuButton(/book a visit/i));
    await user.selectOptions(screen.getByLabelText(/^service/i), "Flu vaccination");
    await user.selectOptions(screen.getByLabelText(/^branch/i), "Scottsville");
    await user.type(screen.getByLabelText(/date you would like/i), nextMonday());
    await user.click(screen.getByRole("radio", { name: "12:00" }));
    await user.type(screen.getByLabelText(/full name/i), "Thandeka Mkhize");
    await user.type(screen.getByLabelText(/cell number/i), "0821234567");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    const dialog = screen.getByRole("dialog", { name: /your visit is booked/i });
    expect(dialog).toHaveTextContent("Flu vaccination");
    expect(dialog).toHaveTextContent("12:00");
    expect(dialog).toHaveTextContent(showDate(nextMonday()));
  });

  test("'Find another service' closes the popup and puts focus on the services heading", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(menuButton(/find a service/i));
    await user.click(screen.getByRole("button", { name: /book baby clinic/i }));
    await user.type(screen.getByLabelText(/full name/i), "Thandeka Mkhize");
    await user.type(screen.getByLabelText(/cell number/i), "0821234567");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    await user.click(screen.getByRole("button", { name: /find another service/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // the booking button is gone, so focus goes to the new page heading instead
    expect(screen.queryByRole("button", { name: /book my visit/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /find a clinic service/i })).toHaveFocus();
    // and the page is not switched off any more
    expect(screen.getByRole("main").closest("[inert]")).toBeNull();
    expect(menuButton(/find a service/i)).toHaveAttribute("aria-current", "page");
  });
});
