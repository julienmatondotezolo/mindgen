export function formatDate(input: string, dateText: any) {
  const dateObj = new Date(input);
  const currentDate = new Date();
  const yesterday = new Date(currentDate);

  yesterday.setDate(currentDate.getDate() - 1);

  // Get the timezone offset in minutes
  const timezoneOffset = dateObj.getTimezoneOffset() * -1;

  // Adjust the date and time to the correct timezone
  dateObj.setMinutes(dateObj.getMinutes() + timezoneOffset);

  // Initialize the formatted date
  let formattedDate = "";

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

    formattedDate = `${dateText("today")}, ${currentHourAndMinutes}`;
  } else if (
    dateObj.getFullYear() === yesterday.getFullYear() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getDate() === yesterday.getDate()
  ) {
    // Get the hour and minutes in 24-hour format in the correct timezone
    const hourAndMinutes = dateObj.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Add this line
    });

    formattedDate = `${dateText("yesterday")}, ${hourAndMinutes}`;
  } else {
    // Format the date as "Month Day, Year"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    formattedDate = `${monthName} ${day}, ${year}`;
  }

  return formattedDate;
}
