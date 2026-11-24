import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import BookingForm from "./BookingForm.jsx";
import { formatDate, nextDateFor } from "../utils/checkForm.js";

// gives back the date of the next Monday, in the same format as the date input
function nextMonday() {
  const date = new Date();
  const daysToAdd = (1 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysToAdd);
  return formatDate(date);
}

describe("BookingForm", () => {
  test("every field has a label", () => {
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    expect(screen.getByLabelText(/^service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^branch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date you would like/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cell number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason for the visit/i)).toBeInTheDocument();
    // the times are a group of radio buttons, named by the legend
    expect(screen.getByRole("radiogroup", { name: /time you would like to come/i })).toBeInTheDocument();
  });

  test("help text is linked to the field with aria-describedby", () => {
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    const cellField = screen.getByLabelText(/cell number/i);
    expect(cellField).toHaveAccessibleDescription(/10 digits, for example 0821234567/i);
  });

  test("an empty form shows errors, marks fields invalid and moves focus to the first one", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    const serviceField = screen.getByLabelText(/^service/i);
    expect(serviceField).toHaveAttribute("aria-invalid", "true");
    expect(serviceField).toHaveFocus();
    expect(serviceField).toHaveAccessibleDescription(/please choose a service/i);

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/cell number/i)).toHaveAttribute("aria-invalid", "true");
  });

  test("the summary and the error messages are in live regions", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    const summary = screen.getByText(/there are 6 problems/i);
    expect(summary).toHaveAttribute("aria-live", "assertive");

    const nameError = screen.getByText(/please type your full name/i);
    expect(nameError).toHaveAttribute("aria-live", "polite");
  });

  test("a field is checked when you leave it after typing in it", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    const nameField = screen.getByLabelText(/full name/i);
    await user.type(nameField, "Thandeka");
    await user.tab();

    expect(nameField).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/please type your name and your surname/i)).toBeInTheDocument();
  });

  test("tabbing past empty fields does not show errors (found in my NVDA test)", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    // Tab through the whole form without filling anything in
    for (let i = 0; i < 9; i++) {
      await user.tab();
    }

    expect(screen.queryByText(/^error:/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("aria-invalid", "false");
  });

  test("changing the service takes away the old time error (found in my NVDA test)", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    expect(screen.getByText(/please choose a service first, then a time/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^service/i), "Blood pressure check");
    await user.selectOptions(screen.getByLabelText(/^service/i), "Sugar check");

    expect(screen.queryByText(/choose a time/i)).not.toBeInTheDocument();
    // the time is still checked when the form is sent again
    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    expect(screen.getByText(/^error: please choose a time\./i)).toBeInTheDocument();
  });

  test("the error goes away when the person fixes the field", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    const cellField = screen.getByLabelText(/cell number/i);
    await user.type(cellField, "123");
    await user.tab();
    expect(cellField).toHaveAttribute("aria-invalid", "true");

    await user.clear(cellField);
    await user.type(cellField, "0821234567");
    expect(cellField).toHaveAttribute("aria-invalid", "false");
  });

  test("a Sunday is not allowed", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    // find the next Sunday
    const date = new Date();
    date.setDate(date.getDate() + ((7 - date.getDay()) % 7 || 7));

    const dateField = screen.getByLabelText(/date you would like/i);
    await user.type(dateField, formatDate(date));
    await user.tab();

    // the help text also says this, so I look for the one that starts with "Error"
    expect(screen.getByText(/^error: the clinic is closed on sundays/i)).toBeInTheDocument();
  });

  test("a filled-in form calls onBooked with the details", async () => {
    const user = userEvent.setup();
    const onBooked = vi.fn();
    render(<BookingForm selectedService={null} onBooked={onBooked} />);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Blood pressure check");
    await user.selectOptions(screen.getByLabelText(/^branch/i), "Scottsville");
    await user.type(screen.getByLabelText(/date you would like/i), nextMonday());
    await user.click(screen.getByRole("radio", { name: "11:00" }));
    await user.type(screen.getByLabelText(/full name/i), "Thandeka Mkhize");
    await user.type(screen.getByLabelText(/cell number/i), "082 123 4567");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(onBooked).toHaveBeenCalledTimes(1);
    const booking = onBooked.mock.calls[0][0];
    expect(booking.cellNumber).toBe("0821234567");
    expect(booking.serviceName).toBe("Blood pressure check");
    expect(booking.visitDate).toBe(nextMonday());
    expect(booking.visitTime).toBe("11:00");
    expect(booking.nurse).toBe("Sister Khumalo");
  });

  test("a service from the list is already filled in, with its next free time", () => {
    const service = { id: 5, name: "Blood pressure check", branch: "Scottsville" };
    render(<BookingForm selectedService={service} onBooked={() => {}} />);

    expect(screen.getByLabelText(/^service/i)).toHaveValue("5");
    expect(screen.getByLabelText(/^branch/i)).toHaveValue("Scottsville");
    // the card says "Monday 08:00", so the next Monday and 08:00 are filled in
    expect(screen.getByLabelText(/date you would like/i)).toHaveValue(nextDateFor("Monday"));
    expect(screen.getByRole("radio", { name: "08:00" })).toBeChecked();
    expect(screen.getByText(/we filled in the next free time/i)).toBeInTheDocument();
  });

  test("the times only show once a service is chosen, and they change with the service", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    const timeGroup = screen.getByRole("radiogroup", { name: /time you would like to come/i });
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(timeGroup).toHaveAccessibleDescription(/choose a service first/i);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    const babyTimes = screen.getAllByRole("radio").map((radio) => radio.value);
    expect(babyTimes).toEqual(["08:00", "09:15", "10:30", "11:45"]);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Sugar check");
    expect(screen.getAllByRole("radio").map((radio) => radio.value)).toEqual(["07:45", "08:45", "10:00", "13:15"]);
  });

  test("changing the service clears a time that the new service does not have", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    // Blood pressure check has 08:00 and 14:00, Baby clinic has 08:00 but not 14:00
    await user.selectOptions(screen.getByLabelText(/^service/i), "Blood pressure check");
    await user.click(screen.getByRole("radio", { name: "08:00" }));
    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    expect(screen.getByRole("radio", { name: "08:00" })).toBeChecked();

    await user.selectOptions(screen.getByLabelText(/^service/i), "Blood pressure check");
    await user.click(screen.getByRole("radio", { name: "14:00" }));
    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    screen.getAllByRole("radio").forEach((radio) => expect(radio).not.toBeChecked());
  });

  test("a missing time is an error: the group is marked invalid and focus goes to the first time", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    await user.selectOptions(screen.getByLabelText(/^branch/i), "Edendale");
    await user.type(screen.getByLabelText(/date you would like/i), nextMonday());
    await user.type(screen.getByLabelText(/full name/i), "Thandeka Mkhize");
    await user.type(screen.getByLabelText(/cell number/i), "0821234567");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));

    expect(screen.getByText(/there is 1 problem/i)).toBeInTheDocument();

    const timeGroup = screen.getByRole("radiogroup", { name: /time you would like to come/i });
    expect(timeGroup).toHaveAttribute("aria-invalid", "true");
    expect(timeGroup).toHaveAttribute("aria-required", "true");
    expect(timeGroup).toHaveAccessibleDescription(/please choose a time/i);
    expect(screen.getByRole("radio", { name: "08:00" })).toHaveFocus();

    // picking a time takes the error away straight away
    await user.click(screen.getByRole("radio", { name: "10:30" }));
    expect(timeGroup).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByText(/please choose a time/i)).not.toBeInTheDocument();
  });

  test("the arrow keys move between the times", async () => {
    const user = userEvent.setup();
    render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    await user.click(screen.getByRole("radio", { name: "08:00" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "09:15" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "09:15" })).toHaveFocus();
  });

  test("has no accessibility problems when it first shows", async () => {
    const { container } = render(<BookingForm selectedService={null} onBooked={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no accessibility problems while it is showing errors", async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no accessibility problems with the times showing and the time missing", async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingForm selectedService={null} onBooked={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/^service/i), "Baby clinic");
    await user.click(screen.getByRole("button", { name: /book my visit/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
