import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { useInvoice } from "./hooks/useInvoice";
import DatePicker from "react-datepicker";
import isArray from "lodash/isArray";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Typography } from "antd";
import { Input } from "antd";
import { Checkbox } from "antd";
import { isDate } from "lodash";
import HolidaysClass from "date-holidays";
import { Select } from "antd";
const { Option } = Select;

const Holidays = new HolidaysClass();
const { Text, Paragraph } = Typography;

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

const refreeDay = 24;
const today = new Date();
const defaultStartDate = new Date(
  today.getFullYear(),
  today.getMonth() - (today.getDate() > refreeDay ? 0 : 1),
  24
);

const defaultEndDate = new Date(
  today.getFullYear(),
  today.getMonth() + (today.getDate() > refreeDay ? 1 : 0),
  23
);

const ALL_COUNTRIES = Holidays.getCountries();

function App() {
  const [selectMode, setSelectMode] = useState(false);
  const [[startDate, endDate], setRangeDates] = useState<
    [Date | null, Date | null]
  >([defaultStartDate, defaultEndDate]);
  const {
    holidays,
    omittedDates,
    expectedHours,
    setWorkingHours,
    setWorkingDays,
    setOmittedDates,
    highlightedDates,
    setHolidays,
    resetHighlights,
    getBillableHours,
  } = useInvoice({
    startDate,
    endDate,
  });

  useEffect(() => {
    setHolidays(
      new HolidaysClass("EG")
        .getHolidays(today.getFullYear())
        .map(({ start }) => start)
    );
  }, [setHolidays]);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ marginBottom: 50 }}>
          <Text underline>invoi.co</Text>
        </div>

        <div
          style={{ marginBottom: 20, flexDirection: "row", display: "flex" }}
        >
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
            disabledKeyboardNavigation
            monthsShown={3}
            selectsRange={!selectMode}
            startDate={startDate}
            endDate={endDate}
            focusSelectedMonth
            minDate={selectMode ? startDate : null}
            maxDate={selectMode ? endDate : null}
            highlightDates={[
              { "react-datepicker__day--highlighted": highlightedDates },
              { "react-datepicker__day--highlighted-1": omittedDates },
              { "react-datepicker__day--highlighted-2": holidays },
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
          <div style={{ flexDirection: "column", display: "flex" }}>
            <Button onClick={() => setSelectMode((prevMode) => !prevMode)}>
              {selectMode
                ? "Select your date range"
                : "Manuallay select your vacations 🎉"}
            </Button>

            <div style={{ marginTop: 50, marginBottom: 20 }}>
              <Text type="success">Holidays? No Problemo</Text>
            </div>
            <Select
              showSearch
              defaultValue={"EG"}
              onChange={(newCountry) => {
                setHolidays(
                  new HolidaysClass(newCountry)
                    .getHolidays(today.getFullYear())
                    .map(({ start }) => start)
                );
              }}
            >
              {Object.keys(ALL_COUNTRIES).map((countryKey) => (
                <Option key={countryKey} value={countryKey}>
                  {ALL_COUNTRIES[countryKey]}
                </Option>
              ))}
            </Select>
          </div>
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
