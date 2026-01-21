// MonthPickerForm.tsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RenderCustomMonth = () => {
  const renderMonthContent = (
    month: number,
    shortMonth: string,
    longMonth: string,
    day: Date,
  ): React.ReactNode => {
    const fullYear = new Date(day).getFullYear();
    const tooltipText = `Tooltip for month: ${longMonth} ${fullYear}`;

    return <span title={tooltipText}>{shortMonth}</span>;
  };

  return (
    <DatePicker
      selected={new Date()}
      renderMonthContent={renderMonthContent}
      showMonthYearPicker
      dateFormat="MM/yyyy"
    />
  );
};

export default RenderCustomMonth;