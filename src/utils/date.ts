
export function timeRemaining(futureDate: Date) {
  const now = new Date();
  const differenceInMilliseconds = futureDate.getTime() - now.getTime();

  if (differenceInMilliseconds <= 0) {
    return "The date has already passed.";
  }

  let years = futureDate.getFullYear() - now.getFullYear();
  let months = futureDate.getMonth() - now.getMonth();
  let days = futureDate.getDate() - now.getDate();
  let hours = futureDate.getHours() - now.getHours();
  let minutes = futureDate.getMinutes() - now.getMinutes();
  // Adjust for negative values
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }

  if (hours < 0) {
    hours += 24;
    days -= 1;
  }

  if (days < 0) {
    // Get the number of days in the previous month
    const previousMonth = new Date(futureDate.getFullYear(), futureDate.getMonth(), 0).getDate();
    days += previousMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return `${years}Y ${months}M ${days}D ${hours}H ${minutes}M` 
}
