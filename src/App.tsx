import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { useInvoice } from "./hooks/useInvoice";
import DatePicker from "react-datepicker";
import isArray from "lodash/isArray";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, Typography } from "antd";
import { Input } from "antd";
import { Checkbox } from "antd";
import { isDate } from "lodash";
import HolidaysClass from "date-holidays";
import { Select } from "antd";
const { Option } = Select;

const Holidays = new HolidaysClass();
const { Text, Title, Paragraph, Link } = Typography;

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

const Indicator = ({
  backgroundColor,
  guide,
}: {
  backgroundColor: string;
  guide: string;
}) => {
  return (
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          backgroundColor: backgroundColor,
          marginRight: 10,
        }}
      />
      <Text>{guide}</Text>
    </div>
  );
};

function App() {
  const [helpMode, setHelpMode] = useState(false);
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
      <div style={{ marginBottom: 50 }}>
        <Title code>invoi.co</Title>
        <Button onClick={() => setHelpMode((prevHelpMode) => !prevHelpMode)}>
          Toggle the help!
        </Button>
      </div>
      {helpMode && (
        <Modal
          title="Helpful Modal"
          visible={helpMode}
          onOk={() => setHelpMode(false)}
          onCancel={() => setHelpMode(false)}
        >
          <div style={{ marginBottom: 30 }}>
            <Paragraph>
              Howdie! Do not get confused, after reading this short paragraph
              you will be able to get the most out of this humble project. I
              will keep it short and simple. Promise!
            </Paragraph>
            <Paragraph>
              <Text code>Week days (Checkboxes)</Text> First, you can see below
              the days of the week, which basically represents the days you
              usually work during the week. You can tick or untick it for
              customisability.
            </Paragraph>
            <Paragraph>
              <Text code>Datepicker</Text> Second, you can see the Date picker
              which is the coolest part of the application. by default it has a
              default range from 24 previous month to 23 this month (personal
              preference). By default you have the selecting tool, you can click
              anywhere on the calendar to assign the{" "}
              <Text code>start date</Text> and click once again past it to
              assign the <Text code>end date</Text>. There also exists another
              mode where you can select the vacations that you took in order to
              exclude them from the expected hours count through click on{" "}
              <Text code>Manually select your vacations 🎉</Text> and then
              proceed to picking your vacations and watch the magic happen.
            </Paragraph>
            <Paragraph>
              <Text code>Holidays</Text> Third, this application supports
              marking the holidays, so that you can know which days are off for
              you according to your current location and further excluding them
              also from expected hours. If you can't find your country feel free
              to request it{" "}
              <Link
                href="https://github.com/yousseftarekkh/invoico/issues"
                target="_blank"
              >
                here
              </Link>
              .
            </Paragraph>
          </div>
        </Modal>
      )}
      <div style={{ marginBottom: 10, flexDirection: "row", display: "flex" }}>
        <Checkbox.Group
          options={options}
          defaultValue={defaultOptions}
          onChange={(ev) => {
            setWorkingDays(ev as any);
          }}
        />
      </div>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          marginBottom: 20,
          justifyContent: "space-around",
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            addonBefore="Working Hours"
            width="50%"
            onChange={(ev) => setWorkingHours(parseInt(ev.target.value, 10))}
          />
        </div>
      </div>
      <div className="Content-container">
        <DatePicker
          inline
          disabledKeyboardNavigation
          monthsShown={2}
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
          <div>
            <Indicator
              guide="Indicates Working Days 🙈"
              backgroundColor="#3dcc4a"
            />
            <Indicator
              guide="Indicates Holidays 🎉"
              backgroundColor="#d319d3"
            />
            <Indicator
              guide="Indicates selected vacations 🎯"
              backgroundColor="#d32222"
            />
            <Indicator
              guide="Indicates Selected Days for billing 🎯"
              backgroundColor="#216ba5"
            />
          </div>
          <Button onClick={() => setSelectMode((prevMode) => !prevMode)}>
            {selectMode
              ? "Select your date range"
              : "Manually select your vacations 🎉"}
          </Button>

          <div style={{ marginTop: 50, marginBottom: 20 }}>
            <Text type="success">
              Holidays? No Problemo! Pick your country!
            </Text>
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
      <div className="Billable-hours">
        <Button onClick={() => getBillableHours()}>
          Get Dem Billable Hours
        </Button>

        {
          <Text>
            Expected Hours: {expectedHours ? expectedHours : "^Click me^"}
          </Text>
        }
      </div>
    </div>
  );
}

export default App;
