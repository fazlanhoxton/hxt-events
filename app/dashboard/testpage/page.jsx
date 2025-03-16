"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TestPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Next.js DateTime Picker</h1>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Select Date & Time:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
