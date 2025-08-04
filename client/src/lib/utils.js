export function formatMessageTime(date) {
  try {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    console.error("Invalid date:", date);
    return "--:--";
  }
}
