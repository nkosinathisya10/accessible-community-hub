import { useState, useRef } from "react";
import FormField from "./FormField.jsx";
import TimeChoice from "./TimeChoice.jsx";
import { services, branches } from "../data/services.js";
import { checkField, checkAll, fieldOrder, formatDate, nextDateFor } from "../utils/checkForm.js";

// The booking form. It checks each field when you leave it (blur), and it
// checks again as you type once a field has an error, so you see right away
// when you have fixed it.

const serviceOptions = [{ value: "", label: "Choose a service" }].concat(
  services.map((service) => ({ value: String(service.id), label: service.name }))
);

const branchOptions = [{ value: "", label: "Choose a branch" }].concat(
  branches.map((branch) => ({ value: branch, label: branch }))
);

const emptyForm = {
  service: "",
  branch: "",
  visitDate: "",
  visitTime: "",
  fullName: "",
  cellNumber: "",
  reason: "",
  sms: true,
};

// finds the full service from the list, using the id from the select box
function findService(id) {
  return services.find((service) => String(service.id) === String(id));
}

function BookingForm({ selectedService, onBooked }) {
  // If the person came from the services list, fill in the service, the branch
  // and the next free time for them. They can still change all of it.
  const cameFromList = selectedService ? findService(selectedService.id) : null;

  const [values, setValues] = useState(() => {
    if (!cameFromList) return emptyForm;
    return {
      ...emptyForm,
      service: String(cameFromList.id),
      branch: cameFromList.branch,
      visitDate: nextDateFor(cameFromList.nextFreeDay),
      visitTime: cameFromList.nextFreeTime,
    };
  });
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState("");
  // the note about the filled-in time only makes sense until the form is emptied
  const [showFilledNote, setShowFilledNote] = useState(cameFromList !== null);

  // I keep a reference to each field so I can move focus to the first wrong one
  const fieldRefs = useRef({});

  // today's date, so the date picker does not let you pick the past
  const today = formatDate(new Date());

  // the times for the service that is chosen right now (none if no service yet)
  const chosenService = findService(values.service);
  const times = chosenService ? chosenService.times : [];

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    const newValues = { ...values, [name]: newValue };

    // a new service has its own times, so the old time may not be there any more
    if (name === "service") {
      const newService = findService(newValue);
      if (!newService || !newService.times.includes(values.visitTime)) {
        newValues.visitTime = "";
      }
    }

    setValues(newValues);
    // clear the summary so it can be read out again if the form fails again
    setSummary("");

    // only re-check live if the field already has an error
    const newErrors = { ...errors };
    if (errors[name]) {
      newErrors[name] = checkField(name, newValue, newValues);
    }
    // A new service brings new times, so I take away the old time error.
    // In my NVDA test, moving through the services with the arrow keys read out a
    // new time error for every service I passed. The time is checked again when
    // the form is sent.
    if (name === "service") {
      newErrors.visitTime = "";
    }
    // the time check also depends on the date, so check it again when the date changes
    if (errors.visitTime && name === "visitDate") {
      newErrors.visitTime = checkField("visitTime", newValues.visitTime, newValues);
    }
    setErrors(newErrors);
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    // reason and the SMS box are optional so there is nothing to check
    if (!fieldOrder.includes(name)) return;

    // Leaving an EMPTY field does not show an error. In my NVDA test, just tabbing
    // past the empty fields read out an error for every one, before I had even
    // started. Empty fields are still checked when the form is sent.
    // (A radio button always has a value, so for the times I look at the form instead.)
    const fieldValue = name === "visitTime" ? values.visitTime : value;
    if (fieldValue === "") return;

    if (name === "visitTime") {
      // moving with the arrow keys from one time to the next also fires blur,
      // so I only check when focus really leaves the group of times
      const goingTo = e.relatedTarget;
      if (goingTo && goingTo.name === "visitTime") return;
    }

    setErrors({ ...errors, [name]: checkField(name, fieldValue, values) });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = checkAll(values);
    setErrors(newErrors);

    const wrongFields = fieldOrder.filter((name) => newErrors[name]);

    if (wrongFields.length > 0) {
      // tell the screen reader how many problems there are
      const howMany = wrongFields.length === 1 ? "is 1 problem" : "are " + wrongFields.length + " problems";
      setSummary("There " + howMany + " with the form. Please fix the errors and try again.");

      // and move focus to the first wrong field so the person does not have to hunt for it
      fieldRefs.current[wrongFields[0]].focus();
      return;
    }

    // everything is fine, tell the page the booking is done
    onBooked({
      serviceName: chosenService.name,
      nurse: chosenService.nurse,
      branch: values.branch,
      visitDate: values.visitDate,
      visitTime: values.visitTime,
      fullName: values.fullName.trim(),
      cellNumber: values.cellNumber.replace(/\s/g, ""),
    });

    // empty the form for the next booking
    setValues(emptyForm);
    setErrors({});
    setSummary("");
    setShowFilledNote(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="form-heading">
      <h2 id="form-heading">Your details</h2>
      <p>Fields marked with a star (*) must be filled in.</p>

      {showFilledNote && (
        <p>
          We filled in the next free time for this service. You can change the date or the time.
        </p>
      )}

      {/* assertive, because the person needs to hear this straight after pressing the button */}
      <p className="form-summary" aria-live="assertive">
        {summary}
      </p>

      <FormField
        id="service"
        label="Service"
        as="select"
        options={serviceOptions}
        required
        helpText="The service you want to book."
        value={values.service}
        error={errors.service}
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={(el) => (fieldRefs.current.service = el)}
      />

      <FormField
        id="branch"
        label="Branch"
        as="select"
        options={branchOptions}
        required
        helpText="The clinic branch you will visit."
        value={values.branch}
        error={errors.branch}
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={(el) => (fieldRefs.current.branch = el)}
      />

      <FormField
        id="visitDate"
        label="Date you would like to come"
        type="date"
        min={today}
        required
        helpText="Pick a weekday or a Saturday. The clinic is closed on Sundays."
        value={values.visitDate}
        error={errors.visitDate}
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={(el) => (fieldRefs.current.visitDate = el)}
      />

      <TimeChoice
        times={times}
        value={values.visitTime}
        error={errors.visitTime}
        onChange={handleChange}
        onBlur={handleBlur}
        firstRadioRef={(el) => (fieldRefs.current.visitTime = el)}
      />

      <FormField
        id="fullName"
        label="Full name"
        type="text"
        autoComplete="name"
        required
        helpText="Your name and surname, like on your ID or clinic card."
        value={values.fullName}
        error={errors.fullName}
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={(el) => (fieldRefs.current.fullName = el)}
      />

      <FormField
        id="cellNumber"
        label="Cell number"
        type="tel"
        autoComplete="tel"
        required
        helpText="10 digits, for example 0821234567. We use it to SMS your reminder."
        value={values.cellNumber}
        error={errors.cellNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={(el) => (fieldRefs.current.cellNumber = el)}
      />

      <FormField
        id="reason"
        label="Reason for the visit (optional)"
        as="textarea"
        helpText="Keep it short. Do not put your ID number here."
        value={values.reason}
        onChange={handleChange}
      />

      <fieldset>
        <legend>Reminder</legend>
        <label className="checkbox-label">
          <input type="checkbox" name="sms" checked={values.sms} onChange={handleChange} />
          Please SMS me a reminder the day before
        </label>
      </fieldset>

      <button type="submit">Book my visit</button>
    </form>
  );
}

export default BookingForm;
