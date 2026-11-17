
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  evaluateCoupon,
  couponBenefit,
} = require("../src/domain/coupon");

const dataAtual = new Date("2026-10-28T12:00:00Z");

// CT01 - Confirmacao: cupom vencido
test("CT01 - Deve recusar cupom vencido", () => {
  const cupom = {
    code: "ANTIGO",
    type: "percent",
    value: 20,
    active: true,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-10-06T23:59:59Z",
  };

  const resultado = evaluateCoupon(cupom, dataAtual);

  assert.equal(resultado.ok, false);
});

// CT02 - Confirmacao: cupom ainda nao iniciado
test("CT02 - Deve recusar cupom futuro", () => {
  const cupom = {
    code: "FUTURO",
    type: "percent",
    value: 10,
    active: true,
    startsAt: "2026-12-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
  };

  const resultado = evaluateCoupon(cupom, dataAtual);

  assert.equal(resultado.ok, false);
});

// CT03 - Regressao: cupom valido
test("CT03 - Deve aceitar cupom valido", () => {
  const cupom = {
    code: "VALIDO",
    type: "percent",
    value: 10,
    active: true,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
  };

  const resultado = evaluateCoupon(cupom, dataAtual);

  assert.equal(resultado.ok, true);
});

// CT04 - Regressao: desconto percentual
test("CT04 - Deve calcular desconto de 20%", () => {
  const cupom = {
    code: "DESCONTO20",
    type: "percent",
    value: 20,
    active: true,
  };

  const desconto = couponBenefit(100, cupom);

  assert.equal(desconto, 20);
});
