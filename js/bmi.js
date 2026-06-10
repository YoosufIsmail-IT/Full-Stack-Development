/**
 * bmi.js
 * ------
 * BMI (Body Mass Index) calculation module.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const BMI_CATEGORIES = [
  { max: 18.5, label: "Underweight",      advice: "Consider consulting a doctor about healthy weight gain." },
  { max: 25.0, label: "Normal weight",    advice: "Great! Maintain your healthy lifestyle." },
  { max: 30.0, label: "Overweight",       advice: "Consider a balanced diet and regular exercise." },
  { max: 35.0, label: "Obese (Class I)",  advice: "Consult a healthcare provider for guidance." },
  { max: 40.0, label: "Obese (Class II)", advice: "Medical supervision is strongly recommended." },
  { max: Infinity, label: "Obese (Class III)", advice: "Please seek immediate medical advice." },
];

// ─── Core BMI Calculation ─────────────────────────────────────────────────────

/**
 * Calculates BMI from weight and height (metric: kg & cm).
 *
 * @param {number} weightKg  - Weight in kilograms.
 * @param {number} heightCm  - Height in centimeters.
 * @returns {number}         - BMI rounded to 2 decimal places.
 *
 * @example
 * calculateBMI(70, 175); // 22.86
 */
function calculateBMI(weightKg, heightCm) {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error("Weight and height must be positive numbers.");
  }

  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

// ─── BMI from Imperial Units ──────────────────────────────────────────────────

/**
 * Calculates BMI from imperial units (lbs & inches).
 *
 * @param {number} weightLbs  - Weight in pounds.
 * @param {number} heightIn   - Height in inches.
 * @returns {number}          - BMI rounded to 2 decimal places.
 *
 * @example
 * calculateBMIImperial(154, 69); // 22.74
 */
function calculateBMIImperial(weightLbs, heightIn) {
  if (weightLbs <= 0 || heightIn <= 0) {
    throw new Error("Weight and height must be positive numbers.");
  }

  return parseFloat(((weightLbs / (heightIn * heightIn)) * 703).toFixed(2));
}

// ─── Get BMI Category ─────────────────────────────────────────────────────────

/**
 * Returns the BMI category label and health advice.
 *
 * @param {number} bmi - The BMI value.
 * @returns {{ label: string, advice: string }}
 *
 * @example
 * getBMICategory(22.86);
 * // { label: "Normal weight", advice: "Great! Maintain your healthy lifestyle." }
 */
function getBMICategory(bmi) {
  if (typeof bmi !== "number" || bmi <= 0) {
    throw new Error("BMI must be a positive number.");
  }

  const category = BMI_CATEGORIES.find((c) => bmi < c.max);
  return { label: category.label, advice: category.advice };
}

// ─── Ideal Weight Range ───────────────────────────────────────────────────────

/**
 * Calculates the ideal weight range (BMI 18.5–24.9) for a given height.
 *
 * @param {number} heightCm - Height in centimeters.
 * @returns {{ minKg: number, maxKg: number, minLbs: number, maxLbs: number }}
 *
 * @example
 * getIdealWeightRange(175);
 * // { minKg: 56.69, maxKg: 76.29, minLbs: 124.97, maxLbs: 168.19 }
 */
function getIdealWeightRange(heightCm) {
  if (heightCm <= 0) throw new Error("Height must be a positive number.");

  const heightM = heightCm / 100;
  const minKg   = parseFloat((18.5 * heightM * heightM).toFixed(2));
  const maxKg   = parseFloat((24.9 * heightM * heightM).toFixed(2));

  return {
    minKg,
    maxKg,
    minLbs: parseFloat((minKg * 2.20462).toFixed(2)),
    maxLbs: parseFloat((maxKg * 2.20462).toFixed(2)),
  };
}

// ─── Full BMI Report ──────────────────────────────────────────────────────────

/**
 * Returns a complete BMI report for a person.
 *
 * @param {Object} person
 * @param {number} person.weightKg  - Weight in kg.
 * @param {number} person.heightCm  - Height in cm.
 * @param {string} [person.name]    - Optional name for the report.
 * @returns {Object}                - Full BMI report.
 *
 * @example
 * getBMIReport({ weightKg: 70, heightCm: 175, name: "Alex" });
 */
function getBMIReport({ weightKg, heightCm, name = "User" }) {
  const bmi          = calculateBMI(weightKg, heightCm);
  const { label, advice } = getBMICategory(bmi);
  const idealRange   = getIdealWeightRange(heightCm);
  const weightDiff   = parseFloat((weightKg - idealRange.maxKg).toFixed(2));

  const report = {
    name,
    weightKg,
    heightCm,
    bmi,
    category:     label,
    advice,
    idealRange,
    weightStatus:
      weightDiff > 0
        ? `${weightDiff} kg above ideal range`
        : weightDiff < 0
        ? `${Math.abs(weightDiff)} kg below ideal range`
        : "Within ideal range",
  };

  console.log(`\n📊 BMI Report for ${name}`);
  console.log(`   Height   : ${heightCm} cm`);
  console.log(`   Weight   : ${weightKg} kg`);
  console.log(`   BMI      : ${bmi}`);
  console.log(`   Category : ${label}`);
  console.log(`   Status   : ${report.weightStatus}`);
  console.log(`   Advice   : ${advice}`);

  return report;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  calculateBMI,
  calculateBMIImperial,
  getBMICategory,
  getIdealWeightRange,
  getBMIReport,
};


// ─── Quick Demo (remove in production) ───────────────────────────────────────

/*
const bmi = require("./bmi");

// Metric
console.log(bmi.calculateBMI(70, 175));          // 22.86
console.log(bmi.getBMICategory(22.86));           // { label: "Normal weight", ... }

// Imperial
console.log(bmi.calculateBMIImperial(154, 69));  // 22.74

// Ideal weight
console.log(bmi.getIdealWeightRange(175));
// { minKg: 56.69, maxKg: 76.29, minLbs: 124.97, maxLbs: 168.19 }

// Full report
bmi.getBMIReport({ weightKg: 90, heightCm: 175, name: "Alex" });
*/
