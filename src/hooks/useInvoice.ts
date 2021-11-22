import { useCallback, useEffect, useState } from "react";

const DAYS = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

// const G_API_KEY = "AIzaSyD1ZXAsgiFAN6lQ6MC3CS-i3-lbiWkfPFg";
type UseInvoiceProps = {
  startDate: Date | undefined | null;
  endDate: Date | undefined | null;
};
const defaultWorkingDays = ["mon", "tue", "wed", "thu", "fri"];

export const useInvoice = (props: UseInvoiceProps) => {
  const [omittedDates, setOmittedDates] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<Date[]>([]);

  const [workingHours, setWorkingHours] = useState(8);
  const [workingDays, setWorkingDays] = useState(defaultWorkingDays);

  const [expectedHours, setExpectedHours] = useState<number | undefined>();
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const resetHighlights = () => {
    setExpectedHours(undefined);
    setHighlightedDates([]);

    setOmittedDates([]);
  };

  // const getHolidays = async () => {
  //   const response = await fetch(
  //     `https://www.googleapis.com/calendar/v3/calendars/en.eg%23holiday%40group.v.calendar.google.com/events?key=${G_API_KEY}&year=${new Date().getFullYear()}`
  //   );
  //   const responseObject = await response.json();
  //   if (responseObject) {
  //     setHolidays(
  //       responseObject.items
  //         .reduce((holds: Date[], holiday: any) => {
  //           const { start } = holiday;
  //           const dayOfInterest = new Date(start.date);
  //           const foundHoliday = holds.findIndex((date) => {
  //             return date.toISOString() === dayOfInterest.toISOString();
  //           });
  //           if (foundHoliday > -1) return holds;
  //           return [...holds, dayOfInterest];
  //         }, [])
  //         .sort(function compare(a: Date, b: Date) {
  //           return (a as any) - (b as any);
  //         })
  //     );
  //   }
  // };
  const getDaysBetweenDates = useCallback(
    (start: Date, end: Date, dayName: keyof typeof DAYS) => {
      let result = [];
      let day = DAYS[dayName];
      // Copy start date
      let current = new Date(start);
      // Shift to next of required days
      current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
      // While less than end date, add dates to result array
      while (current <= end) {
        const dayOfInterest = new Date(+current);
        const foundOmitted = omittedDates.findIndex((date) => {
          return date.toISOString() === dayOfInterest.toISOString();
        });
        const foundHoliday = holidays.findIndex((date) => {
          console.log({ date });

          return date.toISOString() === dayOfInterest.toISOString();
        });
        console.log(foundOmitted, foundHoliday);
        if (foundOmitted === -1 && foundHoliday === -1)
          result.push(dayOfInterest);
        current.setDate(current.getDate() + 7);
      }
      return result;
    },
    [holidays, omittedDates]
  );
  const getBillableHours = useCallback(() => {
    const allBillableDays = workingDays.reduce((allBillable, workDay) => {
      if (props.startDate && props.endDate)
        return [
          ...allBillable,
          ...getDaysBetweenDates(
            props.startDate,
            props.endDate,
            workDay as any
          ),
        ];
      return allBillable;
    }, [] as Date[]);
    setHighlightedDates(allBillableDays);
    if (workingHours) setExpectedHours(allBillableDays.length * workingHours);
    return allBillableDays;
  }, [
    getDaysBetweenDates,
    props.endDate,
    props.startDate,
    workingDays,
    workingHours,
  ]);

  useEffect(() => {
    if (expectedHours) {
      getBillableHours();
    }
  }, [expectedHours, omittedDates, getBillableHours]);

  // useEffect(() => {
  //   getHolidays();
  // }, []);

  return {
    holidays,
    omittedDates,
    expectedHours,
    workingHours,
    highlightedDates,
    workingDays,
    setHolidays,
    setOmittedDates,
    setWorkingDays,
    getBillableHours,
    resetHighlights,
    setWorkingHours,
  };
};
