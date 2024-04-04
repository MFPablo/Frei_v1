export const isValidEmail = (email: string) =>
  /^[a-zA-Z0-9._%+'-]+@[a-zA-Z0-9.-]+[a-zA-Z0-9.'-]+\.[a-zA-Z0-9]{2,}$/.test(email);

// noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass
export const urlValidator = (v: string) =>
  /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(
    v,
  );
export const isArrayWithLength = (v) => Array.isArray(v) && v.length;

export const stringLengthMinEightChar = (s: string) => (s ?? "").length >= 8;

export const stringContainAtLeastOneNumber = (s: string) =>
  /(?=.*[0-9])/.test(s);

export const stringContainAtLeastOneLowerCase = (s: string) =>
  /(?=.*[a-z])/.test(s);

export const stringContainAtLeastOneUpperCase = (s: string) =>
  /(?=.*[A-Z])/.test(s);

export const isValidPassword = (s: string) =>
  stringLengthMinEightChar(s) &&
  stringContainAtLeastOneNumber(s) &&
  stringContainAtLeastOneLowerCase(s) &&
  stringContainAtLeastOneUpperCase(s);

export const isValidLinkedInProfile = (linkedinProfile: string) =>
  /^(http(s)?:\/\/)?(\w{3}\.)?linkedin\.com\/(pub|in|profile)/.test(
    linkedinProfile,
  );

export const onlyLettersAndSpaces = (s: string) =>
  /^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(s);
