const KHMER_PATTERN = /[\u1780-\u17ff]/;

const ERROR_TRANSLATIONS = [
  ["invalid request data", "ទិន្នន័យស្នើសុំមិនត្រឹមត្រូវ។"],
  ["bad credentials", "លេខទូរស័ព្ទ អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ។"],
  ["invalid credentials", "លេខទូរស័ព្ទ អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ។"],
  ["account not found", "រកមិនឃើញគណនីនេះទេ។"],
  ["user not found", "រកមិនឃើញគណនីនេះទេ។"],
  ["member not found", "រកមិនឃើញសមាជិកនេះទេ។"],
  ["account is closed", "គណនីនេះត្រូវបានបិទ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។"],
  ["account closed", "គណនីនេះត្រូវបានបិទ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។"],
  ["account inactive", "គណនីនេះមិនទាន់សកម្មទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។"],
  ["account locked", "គណនីនេះត្រូវបានចាក់សោ។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។"],
  ["otp", "លេខកូដ OTP មិនត្រឹមត្រូវ ឬផុតកំណត់។"],
  ["password", "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ។"],
  ["required", "សូមបញ្ចូលព័ត៌មានដែលត្រូវការ។"],
  ["request failed", "សំណើមិនបានសម្រេច។"],
  ["network", "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។"],
  ["backend", "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។"],
  ["server", "ម៉ាស៊ីនមេមានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។"],
];

export function khmerErrorMessage(message, fallback = "មានបញ្ហាកើតឡើង។") {
  if (!message) return fallback;

  const text = String(message).trim();
  if (!text) return fallback;
  if (KHMER_PATTERN.test(text)) return text;

  const lowerText = text.toLowerCase();
  const match = ERROR_TRANSLATIONS.find(([keyword]) =>
    lowerText.includes(keyword),
  );

  return match?.[1] || fallback;
}
