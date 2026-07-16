"use server";

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}
// Ensure key is exactly 32 bytes for aes-256-cbc
const getKey = () => {
  let key = SECRET_KEY;
  if (key.length < 32) {
    key = key.padEnd(32, "0");
  } else if (key.length > 32) {
    key = key.substring(0, 32);
  }
  return Buffer.from(key);
};

const IV_LENGTH = 16;

export async function encrypt(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    getKey(),
    iv,
  );

  let encrypted = cipher.update(text.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function decrypt(text) {
  if (!text || typeof text !== "string") return "";
  if (!text.includes(":")) return text; // Not encrypted or wrong format
  
  try {
    const [ivHex, encryptedTextHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedTextHex, "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      getKey(),
      iv,
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}
