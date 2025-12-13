import { validate } from "../utils/_auth";
import { certificateCodeToRegistryValue } from "../utils/exams_db.data-utils";
import * as db from "../utils/exams_db";
import {
  climberAddedNextSteps,
  climberAddedNotification,
} from "../utils/_email";
import * as key from "../utils/_key";

function calculateExpiryDate(examDate: string) {
  // Add 3 years to exam date for certificate expiry
  const date = new Date(examDate);
  date.setFullYear(date.getFullYear() + 3);
  return date.toISOString().split("T")[0];
}

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  const {
    username,
    password,
    idCode,
    name,
    email,
    cardType,
    examDate,
    comment,
  } = await readBody(event);
  const authUser = await validate(username, password);

  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Validate required fields
  if (!idCode || !name || !email || !cardType || !examDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  // Validate idCode format (11 digits)
  if (!/^\d{11}$/.test(idCode)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ID code format",
    });
  }

  if (!isIdCodeValid(idCode)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ID code",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email format",
    });
  }

  // Validate card type
  if (!["green", "red"].includes(cardType)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid card type",
    });
  }

  // Create the record with audit info
  const record = {
    idCode,
    name,
    email,
    cardType,
    examDate,
    comment: comment || "",
    addedBy: username,
    addedAt: new Date().toISOString(),
    certificate: cardType,
    examTime: examDate,
    expiryTime: calculateExpiryDate(examDate),
    examiner: username,
  };

  // Row data matching header: formFillTime, id, name, certificate, examDate, expiryDate, daysUntilExpiry, examiner, email, phone, comment, formFillerEmail, formPassword, dataConsent, responsiblityConsent
  const rowData = [
    new Date().toISOString(), // formFillTime
    idCode, // id
    name, // name
    certificateCodeToRegistryValue(cardType), // certificate
    examDate, // examDate
    record.expiryTime, // expiryDate
    "", // daysUntilExpiry - calculated field, left empty (formulas don't work with append API)
    authUser.name, // examiner
    email, // email
    "", // phone - not collected in this form
    comment || "", // comment
    "", // formFillerEmail - not applicable for automatic entry
    "", // formPassword - not applicable for automatic entry
    "", // dataConsent - not collected in this form
    "", // responsiblityConsent - not collected in this form
  ];

  // await db.addRow(sheetsClient, rowData);
  await Promise.all([
    climberAddedNotification(authUser.name, name),
    climberAddedNextSteps(email, name),
  ]);

  return {
    success: true,
    message: "Climber added successfully",
    record: record,
  };
});
