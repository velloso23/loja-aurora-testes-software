"use strict";

const { toCents, fromCents, percentOf } = require("./money");


function evaluateCoupon(coupon, now = new Date()) {
  if (!coupon || coupon.active === false) {
    return { ok: false, message: "Cupom inválido." };
  }

  const currentTime = new Date(now).getTime();

  if (coupon.startsAt) {
    const startTime = new Date(coupon.startsAt).getTime();

    if (currentTime < startTime) {
      return {
        ok: false,
        message: "Cupom ainda não está válido.",
      };
    }
  }

  if (coupon.expiresAt) {
    const expirationTime = new Date(coupon.expiresAt).getTime();

    if (currentTime > expirationTime) {
      return {
        ok: false,
        message: "Cupom expirado.",
      };
    }
  }

  return { ok: true };
}


function couponBenefit(subtotal, coupon) {
  if (!coupon) return 0;

  if (coupon.type === "percent") {
    return percentOf(subtotal, coupon.value);
  }

  if (coupon.type === "fixed") {
    const benefitCents = toCents(coupon.value);
    const subtotalCents = toCents(subtotal);
    return fromCents(Math.min(benefitCents, subtotalCents));
  }

  return 0;
}

module.exports = {
  evaluateCoupon,
  couponBenefit,
};
