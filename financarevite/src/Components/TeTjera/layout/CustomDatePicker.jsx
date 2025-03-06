import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Styles/customStyles.css";

const CustomInput = forwardRef(({ value, onClick, placeholderText }, ref) => (
  <button className="custom-date-input" onClick={onClick} ref={ref}>
    {value || placeholderText}
  </button>
));

const CustomDatePicker = ({ selectedDate, onDateChange, placeholderText, minDate, maxDate }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onDateChange}
      dateFormat="dd/MM/yyyy"
      customInput={<CustomInput placeholderText={placeholderText} />}
      className="custom-datepicker"
      popperClassName="custom-datepicker-popper"
      minDate={minDate}
      maxDate={maxDate}
      
    />
  );
};

export default CustomDatePicker;
