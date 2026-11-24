import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import ServicesPage from "./ServicesPage.jsx";

describe("ServicesPage", () => {
  test("shows all the services and says how many", () => {
    render(<ServicesPage onBook={() => {}} />);

    expect(screen.getByRole("status")).toHaveTextContent("8 services found");
    expect(screen.getAllByRole("article")).toHaveLength(8);
  });

  test("typing in the search box makes the list shorter and updates the count", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.type(screen.getByLabelText(/search for a service/i), "baby clinic");

    expect(screen.getByRole("status")).toHaveTextContent("1 service found");
    expect(screen.getByRole("heading", { name: /baby clinic/i })).toBeInTheDocument();
  });

  test("says so when nothing matches", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.type(screen.getByLabelText(/search for a service/i), "xyz");

    expect(screen.getByRole("status")).toHaveTextContent("0 services found");
    expect(screen.getByText(/no services match/i)).toBeInTheDocument();
  });

  test("the Filters button changes aria-expanded when you click it", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");

    await user.click(filtersButton);
    expect(filtersButton).toHaveAttribute("aria-expanded", "true");

    await user.click(filtersButton);
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");
  });

  test("the Filters button works with the keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    filtersButton.focus();

    await user.keyboard("{Enter}");
    expect(filtersButton).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");
  });

  test("the filter buttons are hidden until the panel is open", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    expect(screen.queryByRole("button", { name: /^child health$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /filters/i }));
    expect(screen.getByRole("button", { name: /^child health$/i })).toBeInTheDocument();
  });

  test("a type button changes aria-pressed and filters the list", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("button", { name: /filters/i }));
    const childButton = screen.getByRole("button", { name: /^child health$/i });
    expect(childButton).toHaveAttribute("aria-pressed", "false");

    await user.click(childButton);
    expect(childButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("2 services found");

    await user.click(childButton);
    expect(childButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("8 services found");
  });

  test("the branch filter works", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.selectOptions(screen.getByLabelText(/^branch/i), "Imbali");

    expect(screen.getByRole("status")).toHaveTextContent("2 services found");
  });

  test("the clear button puts everything back", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.type(screen.getByLabelText(/search for a service/i), "baby");
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(screen.getByRole("button", { name: /clear search and filters/i }));

    expect(screen.getByRole("status")).toHaveTextContent("8 services found");
    expect(screen.getByLabelText(/search for a service/i)).toHaveValue("");
  });

  test("the book button gives the service to the page", async () => {
    const user = userEvent.setup();
    const onBook = vi.fn();
    render(<ServicesPage onBook={onBook} />);

    await user.click(screen.getByRole("button", { name: /book blood pressure check/i }));

    expect(onBook).toHaveBeenCalledTimes(1);
    expect(onBook.mock.calls[0][0].name).toBe("Blood pressure check");
  });

  test("the card shows the next free time and the branch phone number", () => {
    render(<ServicesPage onBook={() => {}} />);

    const card = screen.getByRole("article", { name: /sugar check/i });
    expect(card).toHaveTextContent("Thursday 08:45");
    expect(card).toHaveTextContent("033 000 0001");
  });

  test("the urgency choice is on the page without opening Filters, and starts on not urgent", () => {
    render(<ServicesPage onBook={() => {}} />);

    const group = screen.getByRole("group", { name: /how urgent is it/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /not urgent/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /seen today/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /emergency/i })).not.toBeChecked();
  });

  test("'seen today' only shows services that can fit you in today", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /seen today/i }));

    expect(screen.getByRole("status")).toHaveTextContent("4 services found that can see you today");
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText(/please phone the branch first/i)).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /flu vaccination/i })).not.toBeInTheDocument();
  });

  test("urgency works together with the type filter", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /seen today/i }));
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(screen.getByRole("button", { name: /^child health$/i }));

    // Baby clinic can see you today, Child health check can not
    expect(screen.getByRole("status")).toHaveTextContent("1 service found that can see you today");
    expect(screen.getByRole("heading", { name: /baby clinic/i })).toBeInTheDocument();
  });

  test("'emergency' hides the list and says what to do instead", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /emergency/i }));

    // the status line is a live region, so a screen reader hears this straight away
    expect(screen.getByRole("status")).toHaveTextContent(/emergency chosen\. do not book online\. call 10177 or 112/i);
    expect(screen.getByRole("heading", { name: /this is an emergency/i })).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /^book /i })).not.toBeInTheDocument();
  });

  test("the arrow keys move between the urgency choices", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /not urgent/i }));
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: /seen today/i })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("that can see you today");
  });

  test("the clear button also puts the urgency back to not urgent", async () => {
    const user = userEvent.setup();
    render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /emergency/i }));
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(screen.getByRole("button", { name: /clear search and filters/i }));

    expect(screen.getByRole("radio", { name: /not urgent/i })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("8 services found");
  });

  test("has no accessibility problems for 'seen today' and 'emergency'", async () => {
    const user = userEvent.setup();
    const { container } = render(<ServicesPage onBook={() => {}} />);

    await user.click(screen.getByRole("radio", { name: /seen today/i }));
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("radio", { name: /emergency/i }));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no accessibility problems, closed or open", async () => {
    const user = userEvent.setup();
    const { container } = render(<ServicesPage onBook={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: /filters/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
