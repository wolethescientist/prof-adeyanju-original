/**
 * The event people can register for. Change these details when the lecture's
 * details change; the registration page, its search listing and the form's
 * closing date all follow from here.
 */
export const EVENT = {
  /** Identifies this event in the saved registrations. Do not change it mid-event. */
  key: "inaugural-lecture-2026",
  name: "Inaugural Lecture",
  title: "Prof. Engr. Ibrahim Adepoju Adeyanju Inaugural Lecture",
  /** The day it happens, as YYYY-MM-DD. */
  date: "2026-12-15",
  dateLabel: "Tuesday, 15 December 2026",
  venue: "FUOYE Campus Auditorium",
  place: "Oye-Ekiti, Ekiti State",
  /** The announcement post, linked from the registration page. */
  announcementPath: "/news/prof-engr-ibrahim-adepoju-adeyanju-inaugural-lecture",
  path: "/register",
} as const;

/** Registration closes at the end of the day of the lecture (Nigerian time). */
export function registrationClosed(now: Date = new Date()) {
  return now.getTime() > Date.parse(`${EVENT.date}T23:59:59+01:00`);
}
