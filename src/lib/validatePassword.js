// Shared password strength rule -- at least 6 characters, at least one
// digit, at least one symbol. Mirrors PasswordPolicy.java on the backend so
// the frontend rejects the same inputs before ever hitting the API.
export function getPasswordRules(password) {
  const value = password || "";

  return {
    minimumLength: value.length >= 6,
    hasNumber: /[0-9]/.test(value),
    hasSymbol: /[^A-Za-z0-9]/.test(value),
  };
}

export function isPasswordValid(password) {
  const rules = getPasswordRules(password);
  return rules.minimumLength && rules.hasNumber && rules.hasSymbol;
}
