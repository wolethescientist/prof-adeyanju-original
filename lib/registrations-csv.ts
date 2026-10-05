/**
 * The registrations as a CSV the media team can open in Excel or Google
 * Sheets. Three details matter for real data:
 *  - a phone number is written with a space in it, because a spreadsheet
 *    turns "08031234567" into the number 8031234567 and drops the zero, but
 *    leaves "0803 123 4567" alone;
 *  - a value that begins with = + - or @ is prefixed with an apostrophe, so
 *    a spreadsheet never runs it as a formula;
 *  - a byte-order mark up front makes Excel read names with accents properly.
 */

export type RegistrationRow = {
  createdAt: Date;
  name: string;
  phone: string;
  email: string;
  event: string;
};

function spacedPhone(phone: string) {
  const trimmed = phone.trim();
  if (/\s/.test(trimmed)) return trimmed;
  /* 08031234567 → 0803 123 4567; +2348031234567 → +234 803 123 4567; else after the 4th character. */
  if (/^0\d{10}$/.test(trimmed)) return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}`;
  if (/^\+234\d{10}$/.test(trimmed)) {
    return `+234 ${trimmed.slice(4, 7)} ${trimmed.slice(7, 10)} ${trimmed.slice(10)}`;
  }
  return trimmed.length > 4 ? `${trimmed.slice(0, 4)} ${trimmed.slice(4)}` : trimmed;
}

function safe(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const when = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  dateStyle: "medium",
  timeStyle: "short",
});

export function registrationsCsv(rows: RegistrationRow[]) {
  const lines = [
    ["Registered at", "Name", "Phone", "Email", "Event"],
    ...rows.map((row) => [
      when.format(row.createdAt),
      safe(row.name),
      spacedPhone(row.phone),
      safe(row.email),
      row.event,
    ]),
  ];
  return `﻿${lines.map((line) => line.map(cell).join(",")).join("\r\n")}\r\n`;
}
