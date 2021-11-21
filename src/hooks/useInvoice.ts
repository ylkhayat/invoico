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

type UseInvoiceProps = {
  startDate: Date | undefined | null;
  endDate: Date | undefined | null;
};
const defaultWorkingDays = ["mon", "tue", "wed", "thu", "fri"];

export const useInvoice = (props: UseInvoiceProps) => {
  const [omittedDates, setOmittedDates] = useState<Date[]>([]);

  const [workingHours, setWorkingHours] = useState(8);
  const [workingDays, setWorkingDays] = useState(defaultWorkingDays);

  const [expectedHours, setExpectedHours] = useState<number | undefined>();
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const resetHighlights = () => {
    setExpectedHours(undefined);
    setHighlightedDates([]);
  };
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
        const found = omittedDates.findIndex((date) => {
          return date.toISOString() === dayOfInterest.toISOString();
        });
        if (found === -1) result.push(dayOfInterest);
        current.setDate(current.getDate() + 7);
      }
      return result;
    },
    [omittedDates]
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
    setExpectedHours(allBillableDays.length * workingHours);
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
  return {
    omittedDates,
    expectedHours,
    workingHours,
    highlightedDates,
    workingDays,
    setOmittedDates,
    setWorkingDays,
    getBillableHours,
    resetHighlights,
    setWorkingHours,
  };
};
