export const CARLOHA_WIKI_URL = "https://carloha-wiki.vercel.app/";
export const REQUEST_FORM_URL = "https://docs.google.com/spreadsheets/d/1ucfdCZrvLz7gpWEPJvjFxyrlocfoLJ9W/edit?gid=1941169868#gid=1941169868";
export const REQUEST_FORM_EMBED_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiRrp4RGbgmkp9Upg8JM8cOHJ_nezP6fKYhXMg6ibwpCkpRvzWhzwITb1azWUTlQ/pubhtml?gid=1941169868&single=true&widget=true&headers=false";
export const REQUEST_FORM_SUBMIT_URL = process.env.REQUEST_FORM_SUBMIT_URL || "";
export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL || "gemini-3.1-flash-lite";
export const CONTACT = {
  name: "Brad Hu",
  email: "brad.hu@carloha.com.cn",
  whatsapp: "+86 178 3066 5219"
};
export const SHEETS = {
  vehicleCsvUrl: process.env.NEXT_PUBLIC_VEHICLE_MATERIALS_CSV || "",
  generalCsvUrl: process.env.NEXT_PUBLIC_GENERAL_MATERIALS_CSV || ""
};
