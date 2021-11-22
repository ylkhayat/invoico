import React, { useState } from "react";
import "./App.css";
import { useInvoice } from "./hooks/useInvoice";
import DatePicker from "react-datepicker";
import isArray from "lodash/isArray";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Typography } from "antd";
import { Input } from "antd";
import { Checkbox } from "antd";
import { isDate } from "lodash";

const { Text } = Typography;

const options = [
  { label: "Sunday", value: "sun" },
  { label: "Monday", value: "mon" },
  { label: "Tuesday", value: "tue" },
  { label: "Wednesday", value: "wed" },
  { label: "Thursday", value: "thu" },
  { label: "Friday", value: "fri" },
  { label: "Saturday", value: "sat" },
];

const defaultOptions = ["mon", "tue", "wed", "thu", "fri"];

function App() {
  const [selectMode, setSelectMode] = useState(false);
  const [[startDate, endDate], setRangeDates] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const {
    omittedDates,
    expectedHours,
    setWorkingHours,
    setWorkingDays,
    setOmittedDates,
    highlightedDates,
    resetHighlights,
    getBillableHours,
  } = useInvoice({
    startDate,
    endDate,
  });

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ marginBottom: 50 }}>
          <Text underline>invoi.co</Text>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Checkbox.Group
            options={options}
            defaultValue={defaultOptions}
            onChange={(ev) => {
              setWorkingDays(ev as any);
            }}
          />
        </div>
        <div
          style={{ flexDirection: "row", display: "flex", marginBottom: 20 }}
        >
          <Input
            addonBefore="Working Hours"
            onChange={(ev) => setWorkingHours(parseInt(ev.target.value, 10))}
          />
        </div>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            width: "80%",
            justifyContent: "space-around",
          }}
        >
          <DatePicker
            inline
            monthsShown={2}
            selectsRange={!selectMode}
            startDate={startDate}
            endDate={endDate}
            minDate={selectMode ? startDate : null}
            maxDate={selectMode ? endDate : null}
            highlightDates={[
              { "react-datepicker__day--highlighted": highlightedDates },
              { "react-datepicker__day--highlighted-1": omittedDates },
            ]}
            onChange={(input) => {
              console.log({ input });

              if (!selectMode) {
                if (isArray(input)) {
                  if (input[1] === null) resetHighlights();
                  const [start, end] = input;
                  let evaledEndDate = end;
                  // if (end) evaledEndDate = addDays(new Date(end), 1);
                  setRangeDates([start, evaledEndDate]);
                }
              } else {
                if (isDate(input))
                  setOmittedDates((prevOmittedDates) => {
                    const hasDateIndex = prevOmittedDates.findIndex((date) => {
                      return date.toISOString() === input.toISOString();
                    });

                    if (hasDateIndex > -1) {
                      const newOmmittedDates = [...prevOmittedDates];
                      newOmmittedDates.splice(hasDateIndex, 1);
                      return newOmmittedDates;
                    }
                    return [...prevOmittedDates, input];
                  });
              }
            }}
            isClearable={true}
          />
          <Button onClick={() => setSelectMode((prevMode) => !prevMode)}>
            {selectMode ? "Select your date range" : "Select your vacations 🎉"}
          </Button>
        </div>

        <Button onClick={() => getBillableHours()}>
          Get Dem Billable Hours
        </Button>

        {expectedHours && <Text>Expected Hours: {expectedHours}</Text>}
      </header>
    </div>
  );
}

export default App;
