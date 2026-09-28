import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  computeDeterministicHealth,
  computeDeterministicRisk,
  conditionToScore,
  calculateAgeScore,
  calculateInspectionScore,
  calculateMaintenanceScore,
  DEFAULT_RISK_CONFIG,
} from '../index.js';
import {
  AssetCondition,
  CriticalityLevel,
  RiskLevel,
  MaintenancePriority,
  FindingSeverity,
} from '@infrasphere/shared-types';

describe('InfraSphere Deterministic Health & Risk Engine (Rule-based, NO ML)', () => {
  test('Condition to Score mapping', () => {
    assert.strictEqual(conditionToScore(AssetCondition.EXCELLENT), 100);
    assert.strictEqual(conditionToScore(AssetCondition.GOOD), 80);
    assert.strictEqual(conditionToScore(AssetCondition.FAIR), 55);
    assert.strictEqual(conditionToScore(AssetCondition.POOR), 30);
    assert.strictEqual(conditionToScore(AssetCondition.CRITICAL), 10);
  });

  test('Age score calculation with expected lifetime', () => {
    const brandNewDate = new Date().toISOString();
    const scoreBrandNew = calculateAgeScore(brandNewDate, 20);
    assert.strictEqual(scoreBrandNew, 100);

    // 24 years on 20-year asset = 1.2 ratio <= 1.3 -> 25
    const twentyFourYearsAgo = new Date(Date.now() - 24 * 365.25 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(calculateAgeScore(twentyFourYearsAgo, 20), 25);

    // 30 years on 20-year asset = 1.5 ratio > 1.3 -> 10
    const thirtyYearsAgo = new Date(Date.now() - 30 * 365.25 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(calculateAgeScore(thirtyYearsAgo, 20), 10);
  });

  test('Inspection score decays predictably based on finding severity', () => {
    // No findings: high inspection score
    assert.strictEqual(calculateInspectionScore([]), 95);

    // Critical finding: heavy penalty
    const withCritical = calculateInspectionScore([{ severity: FindingSeverity.CRITICAL }]);
    assert.strictEqual(withCritical, 60); // 100 - 40

    // High and medium findings
    const withMultiple = calculateInspectionScore([
      { severity: FindingSeverity.HIGH },
      { severity: FindingSeverity.MEDIUM },
    ]);
    assert.strictEqual(withMultiple, 65); // 100 - 25 - 10
  });

  test('Deterministic Health Score calculation', () => {
    const result = computeDeterministicHealth(
      AssetCondition.GOOD, // 80
      new Date().toISOString(), // 100
      25,
      [], // 95
      0, // 90
      false,
      2
    );

    // 0.35*80 + 0.20*100 + 0.20*95 + 0.25*90 = 28 + 20 + 19 + 22.5 = 89.5 -> 90
    assert.strictEqual(result.healthScore, 90);
    assert.strictEqual(result.breakdown.conditionScore, 80);
    assert.strictEqual(result.breakdown.ageScore, 100);
  });

  test('Deterministic Risk Score with Criticality multiplier', () => {
    // Low health asset (e.g. Health = 20) with CRITICAL criticality level
    const riskResult = computeDeterministicRisk(20, CriticalityLevel.CRITICAL, 10);

    // Probability of failure should be high
    assert.ok(riskResult.probabilityScore >= 80, 'Probability should be high for degraded asset');
    // Multiplier for CRITICAL is 1.6
    assert.strictEqual(riskResult.criticalityMultiplier, 1.6);
    // Risk score should evaluate to HIGH or CRITICAL
    assert.ok(
      riskResult.riskLevel === RiskLevel.HIGH || riskResult.riskLevel === RiskLevel.CRITICAL,
      `Expected HIGH or CRITICAL risk, got ${riskResult.riskLevel}`
    );
    assert.strictEqual(riskResult.maintenancePriority, MaintenancePriority.URGENT);
  });

  test('Low Risk for pristine asset with low criticality', () => {
    const riskResult = computeDeterministicRisk(95, CriticalityLevel.LOW, 0);
    assert.strictEqual(riskResult.riskLevel, RiskLevel.LOW);
    assert.strictEqual(riskResult.maintenancePriority, MaintenancePriority.LOW);
  });
});
