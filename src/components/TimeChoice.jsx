// The "Time you would like to come" part of the booking form.
// It is a group of radio buttons, one for each time the chosen service has.
// I used real radio buttons so the browser does the keyboard work for me:
// Tab goes into the group and the arrow keys move between the times.

function TimeChoice({ times, value, error, onChange, onBlur, firstRadioRef }) {
  const helpId = "visitTime-help";
  const errorId = "visitTime-error";

  // the same idea as FormField: always linked to the help text,
  // and also to the error when there is one
  let describedBy = helpId;
  if (error) {
    describedBy = helpId + " " + errorId;
  }

  return (
    // role="radiogroup" lets me put aria-required and aria-invalid on the whole group
    <fieldset
      className={error ? "time-choice invalid-group" : "time-choice"}
      role="radiogroup"
      aria-required="true"
      aria-invalid={error ? "true" : "false"}
      aria-describedby={describedBy}
    >
      <legend>
        Time you would like to come
        <span aria-hidden="true"> *</span>
      </legend>

      <span id={helpId} className="help-text">
        {times.length > 0
          ? "These are the times for the service you chose."
          : "Choose a service first. Its times will show here."}
      </span>

      {times.length > 0 && (
        <div className="time-options">
          {times.map((time, index) => (
            <label key={time} className="time-option">
              <input
                type="radio"
                name="visitTime"
                value={time}
                checked={value === time}
                onChange={onChange}
                onBlur={onBlur}
                // the first radio is where focus goes if the time is missing
                ref={index === 0 ? firstRadioRef : undefined}
              />
              {time}
            </label>
          ))}
        </div>
      )}

      {/* always on the page, the same as the other error messages */}
      <p id={errorId} className="error" aria-live="polite">
        {error ? "Error: " + error : ""}
      </p>
    </fieldset>
  );
}

export default TimeChoice;
