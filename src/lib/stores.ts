import { type Writable, writable } from "svelte/store";

const buttonClass =
  "text-lg px-3 py-2 rounded-md text-slate-100 bg-white/[.06] border border-slate-300 focus:ring";
// TODO: Split config variables into separate file
// Set transition duration in ms
const duration = 250;
// Limit file upload
const maxSizeInMB = 20;
const maxVaultSizeinMB = 20;
const maxSize = 1048576 * maxSizeInMB;
const maxVaultSize = 1048576 * maxVaultSizeinMB;
const maxVaultFilesCount = 10;
const tokenMinLength = 1;
const tokenMaxLength = 20;

const filesCache: Writable<[Date, Record<string, string>[]]> = writable();
const inputFiles: Writable<FileList> = writable();
const filesInput: Writable<HTMLInputElement> = writable();
const loading = writable(false);
const token = writable("");
const success = writable(false);
const error = writable([false, ""]);

// Confirm modal stores
const confirmVisible = writable(false);
type confirmType = "delete" | "deleteAll";
const confirmData: Writable<[confirmType, string, any]> = writable();
const confirmResult = writable(false);

export {
  buttonClass,
  duration,
  maxSizeInMB,
  maxSize,
  maxVaultSizeinMB,
  maxVaultSize,
  tokenMinLength,
  tokenMaxLength,
  maxVaultFilesCount,
  filesCache,
  inputFiles,
  filesInput,
  loading,
  token,
  success,
  error,
  confirmVisible,
  confirmData,
  confirmResult,
  type confirmType
};
