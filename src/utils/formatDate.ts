export function formatDate(input: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateObj = new Date(input);
  const monthName = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const currentDate = new Date();

  // Get the timezone offset in minutes
  const timezoneOffset = dateObj.getTimezoneOffset() * -1;

  // Adjust the date and time to the correct timezone
  dateObj.setMinutes(dateObj.getMinutes() + timezoneOffset);

  let formattedDate = `${monthName} ${day}, ${year}`;

  // Compare the year, month, and day of both dates
  if (
    dateObj.getFullYear() === currentDate.getFullYear() &&
    dateObj.getMonth() === currentDate.getMonth() &&
    dateObj.getDate() === currentDate.getDate()
  ) {
    // Get the current hour and minutes in 24-hour format in the correct timezone
    const currentHourAndMinutes = dateObj.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Add this line
    });

    formattedDate += ` ${currentHourAndMinutes}`;
  }

  return formattedDate;
}
