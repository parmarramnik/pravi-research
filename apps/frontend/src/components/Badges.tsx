import React from 'react';
import {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  CriticalityLevel,
  RiskLevel,
  MaintenancePriority,
  FindingSeverity,
} from '@infrasphere/shared-types';

export const RiskBadge: React.FC<{ level?: string; score?: number }> = ({ level, score }) => {
  let bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
  if (level === 'CRITICAL' || (score !== undefined && score >= 75)) {
    bg = 'bg-rose-950/70 text-rose-300 border-rose-800 font-bold';
  } else if (level === 'HIGH' || (score !== undefined && score >= 50)) {
    bg = 'bg-amber-950/70 text-amber-300 border-amber-800';
  } else if (level === 'MEDIUM' || (score !== undefined && score >= 25)) {
    bg = 'bg-yellow-950/60 text-yellow-300 border-yellow-800';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono border ${bg}`}>
      {level || (score !== undefined ? `${score}/100` : 'LOW')}
      {score !== undefined && level ? ` (${score})` : ''}
    </span>
  );
};

export const HealthBadge: React.FC<{ score?: number }> = ({ score = 80 }) => {
  let color = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
  let label = 'EXCELLENT';

  if (score < 25) {
    color = 'text-rose-300 bg-rose-950/70 border-rose-800 font-bold';
    label = 'CRITICAL';
  } else if (score < 50) {
    color = 'text-rose-400 bg-rose-950/50 border-rose-800';
    label = 'POOR';
  } else if (score < 75) {
    color = 'text-amber-300 bg-amber-950/60 border-amber-800';
    label = 'FAIR';
  } else if (score < 90) {
    color = 'text-indigo-300 bg-indigo-950/60 border-indigo-800';
    label = 'GOOD';
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono border ${color}`}>
      <span>HEALTH:</span>
      <span className="font-bold">{score}</span>
      <span className="text-[10px] opacity-75">[{label}]</span>
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition?: string }> = ({ condition = 'GOOD' }) => {
  let style = 'bg-emerald-950/50 text-emerald-400 border-emerald-800';
  if (condition === 'CRITICAL') style = 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold';
  else if (condition === 'POOR') style = 'bg-rose-950/40 text-rose-400 border-rose-800';
  else if (condition === 'FAIR') style = 'bg-amber-950/50 text-amber-300 border-amber-800';
  else if (condition === 'EXCELLENT') style = 'bg-emerald-950/70 text-emerald-300 border-emerald-700 font-medium';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono border ${style}`}>
      {condition}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  if (category === 'BUILDINGS') style = 'bg-sky-950/60 text-sky-300 border-sky-800';
  else if (category === 'WATER') style = 'bg-cyan-950/60 text-cyan-300 border-cyan-800';
  else if (category === 'TRANSPORT') style = 'bg-amber-950/60 text-amber-300 border-amber-800';
  else if (category === 'ELECTRICAL') style = 'bg-violet-950/60 text-violet-300 border-violet-800';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono border ${style}`}>
      {category}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let style = 'bg-emerald-950/50 text-emerald-400 border-emerald-800';
  if (status === 'CRITICAL' || status === 'DAMAGED') style = 'bg-rose-950/70 text-rose-300 border-rose-800 font-bold';
  else if (status === 'UNDER_REPAIR' || status === 'UNDER_MAINTENANCE') style = 'bg-amber-950/60 text-amber-300 border-amber-800';
  else if (status === 'INACTIVE' || status === 'RETIRED') style = 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono border ${style}`}>
      {status}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  if (severity === 'CRITICAL') style = 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold';
  else if (severity === 'HIGH') style = 'bg-rose-950/50 text-rose-400 border-rose-800 font-medium';
  else if (severity === 'MEDIUM') style = 'bg-amber-950/60 text-amber-300 border-amber-800';
  else if (severity === 'LOW') style = 'bg-emerald-950/50 text-emerald-400 border-emerald-800';

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono border ${style}`}>
      {severity}
    </span>
  );
};
