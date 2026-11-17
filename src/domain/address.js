
"use strict";

const FIELDS = ["street", "number", "district", "city", "state", "zip"];

function normalizeAddress(input) {
  const source = input && typeof input === "object" ? input : {};
  const address = {};

  for (const field of FIELDS) {
    address[field] = String(source[field] ?? "").trim();
  }

  // DEF-P2-02: verificar se todos os campos estão preenchidos.
  const missingFields = FIELDS.filter((field) => !address[field]);

  if (missingFields.length > 0) {
    return {
      ok: false,
      address,
      message: "Endereço incompleto. Preencha todos os campos obrigatórios.",
      missingFields
    };
  }

  return {
    ok: true,
    address
  };
}

module.exports = {
  normalizeAddress,
  FIELDS
};
