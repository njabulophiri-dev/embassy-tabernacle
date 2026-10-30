export const eventDates: Record<string, string | null> = {
  "b4ileave-varsity-summit": null,
  "night-prayer": null,
  "singles-service": null,
  "first-sunday-service": null,
  "passover-conference": null,
};

export const pastEventIds = new Set(["b4ileave-varsity-summit", "night-prayer"]);

export function getSouthAfricanToday(now = new Date()): string {
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the current South African date.");
  }

  return `${year}-${month}-${day}`;
}

export function isPastEventDate(
  eventDate: string | null,
  today = getSouthAfricanToday(),
): boolean {
  return eventDate !== null && eventDate < today;
}
