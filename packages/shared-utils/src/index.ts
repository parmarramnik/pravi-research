/**
 * InfraSphere Shared Utilities & Deterministic Rule Engine
 */
import {
  AssetCondition,
  CriticalityLevel,
  RiskLevel,
  MaintenancePriority,
  RiskConfig,
  RiskScoreBreakdown,
  FindingSeverity,
} from '@infrasphere/shared-types';

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  conditionWeight: 0.35,
  ageWeight: 0.20,
  inspectionWeight: 0.20,
  maintenanceWeight: 0.25,
  criticalMultiplierMap: {
    [CriticalityLevel.LOW]: 1.0,
    [CriticalityLevel.MEDIUM]: 1.15,
    [CriticalityLevel.HIGH]: 1.35,
    [CriticalityLevel.CRITICAL]: 1.6,
  },
  healthThresholds: {
    critical: 25,
    poor: 50,
    fair: 75,
    good: 90,
    excellent: 100,
  },
  riskThresholds: {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100,
  },
};

/**
 * Maps condition to 0-100 score
 */
export function conditionToScore(condition: AssetCondition): number {
  switch (condition) {
    case AssetCondition.EXCELLENT:
      return 100;
    case AssetCondition.GOOD:
      return 80;
    case AssetCondition.FAIR:
      return 55;
    case AssetCondition.POOR:
      return 30;
    case AssetCondition.CRITICAL:
      return 10;
    default:
      return 70;
  }
}

/**
 * Calculates Age score (0-100, where 100 is brand new, decaying as age approaches or exceeds expected life)
 */
export function calculateAgeScore(
  installationDateStr?: string,
  expectedLifeYears: number = 20
): number {
  if (!installationDateStr) return 80;
  const installDate = new Date(installationDateStr);
  const now = new Date();
  const ageYears = Math.max(0, (now.getTime() - installDate.getTime()) / (365.25 * 24 * 3600 * 1000));
  const ratio = ageYears / (expectedLifeYears || 20);
  
  if (ratio <= 0.2) return 100;
  if (ratio <= 0.5) return 85;
  if (ratio <= 0.8) return 65;
  if (ratio <= 1.0) return 45;
  if (ratio <= 1.3) return 25;
  return 10; // Exceeded lifetime
}

/**
 * Calculates inspection score based on findings severity
 */
export function calculateInspectionScore(
  findings: { severity: FindingSeverity }[] = []
): number {
  if (!findings || findings.length === 0) return 95;

  let deduction = 0;
  for (const f of findings) {
    switch (f.severity) {
      case FindingSeverity.CRITICAL:
        deduction += 40;
        break;
      case FindingSeverity.HIGH:
        deduction += 25;
        break;
      case FindingSeverity.MEDIUM:
        deduction += 10;
        break;
      case FindingSeverity.LOW:
        deduction += 3;
        break;
    }
  }

  return Math.max(5, Math.min(100, 100 - deduction));
}

/**
 * Calculates maintenance score based on open work orders or overdue status
 */
export function calculateMaintenanceScore(
  openWorkOrdersCount: number = 0,
  hasEmergency: boolean = false,
  monthsSinceLastMaintenance: number = 3
): number {
  let score = 90;
  if (hasEmergency) score -= 45;
  score -= openWorkOrdersCount * 12;
  if (monthsSinceLastMaintenance > 12) score -= 20;
  else if (monthsSinceLastMaintenance > 6) score -= 10;

  return Math.max(10, Math.min(100, score));
}

/**
 * Deterministic Health Score Calculation
 * healthScore = 0.35 * conditionScore + 0.20 * ageScore + 0.20 * inspectionScore + 0.25 * maintenanceScore
 */
export function computeDeterministicHealth(
  condition: AssetCondition,
  installationDate?: string,
  expectedLifeYears?: number,
  findings: { severity: FindingSeverity }[] = [],
  openWorkOrdersCount: number = 0,
  hasEmergency: boolean = false,
  monthsSinceLastMaintenance: number = 3,
  config: RiskConfig = DEFAULT_RISK_CONFIG
): { healthScore: number; breakdown: Partial<RiskScoreBreakdown> } {
  const conditionScore = conditionToScore(condition);
  const ageScore = calculateAgeScore(installationDate, expectedLifeYears);
  const inspectionScore = calculateInspectionScore(findings);
  const maintenanceScore = calculateMaintenanceScore(openWorkOrdersCount, hasEmergency, monthsSinceLastMaintenance);

  const rawHealth =
    config.conditionWeight * conditionScore +
    config.ageWeight * ageScore +
    config.inspectionWeight * inspectionScore +
    config.maintenanceWeight * maintenanceScore;

  const healthScore = Math.round(Math.max(0, Math.min(100, rawHealth)));

  return {
    healthScore,
    breakdown: {
      conditionScore,
      ageScore,
      inspectionScore,
      maintenanceScore,
    },
  };
}

/**
 * Deterministic Risk Score Calculation
 * riskScore = (probabilityScore * impactScore * criticalityMultiplier) normalized to 0-100
 * Notice: High Health = Low Failure Probability
 */
export function computeDeterministicRisk(
  healthScore: number,
  criticality: CriticalityLevel,
  activeDefectWeight: number = 0,
  config: RiskConfig = DEFAULT_RISK_CONFIG
): {
  riskScore: number;
  riskLevel: RiskLevel;
  maintenancePriority: MaintenancePriority;
  probabilityScore: number;
  impactScore: number;
  criticalityMultiplier: number;
} {
  // Probability of failure is inverse of health, plus active defect weight
  const probabilityScore = Math.max(5, Math.min(100, (100 - healthScore) + activeDefectWeight));

  // Impact score is derived from criticality
  let impactScore = 30;
  switch (criticality) {
    case CriticalityLevel.CRITICAL:
      impactScore = 95;
      break;
    case CriticalityLevel.HIGH:
      impactScore = 75;
      break;
    case CriticalityLevel.MEDIUM:
      impactScore = 50;
      break;
    case CriticalityLevel.LOW:
      impactScore = 25;
      break;
  }

  const multiplier = config.criticalMultiplierMap[criticality] || 1.0;

  // Normalized: (P * I / 100) * multiplier
  const rawRisk = ((probabilityScore * impactScore) / 100) * (multiplier / 1.3);
  const riskScore = Math.round(Math.max(0, Math.min(100, rawRisk)));

  // Risk Level
  let riskLevel = RiskLevel.LOW;
  if (riskScore >= config.riskThresholds.high) {
    riskLevel = RiskLevel.CRITICAL;
  } else if (riskScore >= config.riskThresholds.medium) {
    riskLevel = RiskLevel.HIGH;
  } else if (riskScore >= config.riskThresholds.low) {
    riskLevel = RiskLevel.MEDIUM;
  }

  // Maintenance Priority
  let maintenancePriority = MaintenancePriority.LOW;
  if (riskLevel === RiskLevel.CRITICAL || healthScore < 30) {
    maintenancePriority = MaintenancePriority.URGENT;
  } else if (riskLevel === RiskLevel.HIGH || healthScore < 55) {
    maintenancePriority = MaintenancePriority.HIGH;
  } else if (riskLevel === RiskLevel.MEDIUM || healthScore < 75) {
    maintenancePriority = MaintenancePriority.NORMAL;
  }

  return {
    riskScore,
    riskLevel,
    maintenancePriority,
    probabilityScore,
    impactScore,
    criticalityMultiplier: multiplier,
  };
}

/**
 * Structured Logger
 */
export class StructuredLogger {
  constructor(private serviceName: string) {}

  private log(level: string, message: string, meta?: any) {
    const logObj = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...(meta || {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logObj));
  }

  info(message: string, meta?: any) {
    this.log('INFO', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('WARN', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('ERROR', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('DEBUG', message, meta);
  }
}
