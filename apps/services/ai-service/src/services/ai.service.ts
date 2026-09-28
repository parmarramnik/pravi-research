import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('AiService');

export class AiAssistantService {
  private geminiApiKey: string;
  private assetServiceUrl: string;
  private riskServiceUrl: string;
  private inspectionServiceUrl: string;
  private maintenanceServiceUrl: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.assetServiceUrl = process.env.ASSET_SERVICE_URL || 'http://localhost:3001';
    this.riskServiceUrl = process.env.RISK_SERVICE_URL || 'http://localhost:3004';
    this.inspectionServiceUrl = process.env.INSPECTION_SERVICE_URL || 'http://localhost:3002';
    this.maintenanceServiceUrl = process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:3003';
  }

  /**
   * Fetches real context data from downstream microservices
   */
  private async gatherContext(assetId?: string, query?: string) {
    let targetAsset: any = null;
    let riskData: any = null;
    let inspections: any[] = [];
    let workOrders: any[] = [];
    let dependencies: any = null;
    let allAssetsSummary: any[] = [];

    try {
      // If assetId is not provided, check if query contains an asset code (e.g. ELC-000001, BLD-000002)
      let resolvedAssetId = assetId;
      if (!resolvedAssetId && query) {
        const codeMatch = query.match(/(BLD|WTR|TRN|ELC)-\d{6}/i);
        if (codeMatch) {
          const listRes = await fetch(`${this.assetServiceUrl}/api/assets?search=${codeMatch[0]}`);
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (listJson.data && listJson.data.length > 0) {
              resolvedAssetId = listJson.data[0].id;
            }
          }
        }
      }

      if (resolvedAssetId) {
        // Fetch target asset details
        const [assetRes, riskRes, inspRes, woRes, depRes] = await Promise.allSettled([
          fetch(`${this.assetServiceUrl}/api/assets/${resolvedAssetId}`),
          fetch(`${this.riskServiceUrl}/api/risks/${resolvedAssetId}`),
          fetch(`${this.inspectionServiceUrl}/api/inspections/asset/${resolvedAssetId}`),
          fetch(`${this.maintenanceServiceUrl}/api/maintenance/asset/${resolvedAssetId}`),
          fetch(`${this.assetServiceUrl}/api/assets/${resolvedAssetId}/dependencies`),
        ]);

        if (assetRes.status === 'fulfilled' && assetRes.value.ok) {
          const j = await assetRes.value.json();
          targetAsset = j.data;
        }
        if (riskRes.status === 'fulfilled' && riskRes.value.ok) {
          const j = await riskRes.value.json();
          riskData = j.data;
        }
        if (inspRes.status === 'fulfilled' && inspRes.value.ok) {
          const j = await inspRes.value.json();
          inspections = j.data || [];
        }
        if (woRes.status === 'fulfilled' && woRes.value.ok) {
          const j = await woRes.value.json();
          workOrders = j.data || [];
        }
        if (depRes.status === 'fulfilled' && depRes.value.ok) {
          const j = await depRes.value.json();
          dependencies = j.data;
        }
      } else {
        // Broad summary for queries like "Show me all critical assets", "Which bridges need inspection"
        const listRes = await fetch(`${this.assetServiceUrl}/api/assets?limit=50`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          allAssetsSummary = listJson.data || [];
        }
      }
    } catch (err: any) {
      logger.error('Error gathering context from services', { error: err.message });
    }

    return { targetAsset, riskData, inspections, workOrders, dependencies, allAssetsSummary };
  }

  public async chat(query: string, assetId?: string, history: { role: string; content: string }[] = []) {
    logger.info('Processing AI query', { query, assetId, hasApiKey: Boolean(this.geminiApiKey) });

    const context = await this.gatherContext(assetId, query);

    // If Gemini API key is configured, call Google Gemini REST API
    if (this.geminiApiKey) {
      try {
        const answer = await this.callGeminiApi(query, context, history);
        return {
          answer,
          factsUsed: this.extractFacts(context),
          suggestions: this.generateSuggestions(context),
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        logger.warn('Gemini API call failed, falling back to deterministic intelligence engine', {
          error: err.message,
        });
      }
    }

    // Fallback: Deterministic domain-grounded intelligence
    const fallbackAnswer = this.generateDeterministicResponse(query, context);
    return {
      answer: fallbackAnswer,
      factsUsed: this.extractFacts(context),
      suggestions: this.generateSuggestions(context),
      timestamp: new Date().toISOString(),
    };
  }

  private extractFacts(context: any) {
    if (context.targetAsset) {
      return {
        assetCode: context.targetAsset.assetCode,
        name: context.targetAsset.name,
        healthScore: context.riskData?.healthScore ?? context.targetAsset.healthScore,
        riskScore: context.riskData?.riskScore ?? context.targetAsset.riskScore,
        criticality: context.targetAsset.criticality,
        status: context.targetAsset.status,
        findingsCount: context.inspections?.reduce((acc: number, i: any) => acc + (i.findings?.length || 0), 0) || 0,
        openWorkOrdersCount: context.workOrders?.length || 0,
        dependenciesCount: (context.dependencies?.downstream?.length || 0) + (context.dependencies?.upstream?.length || 0),
      };
    }
    return {
      totalAssetsLoaded: context.allAssetsSummary?.length || 0,
    };
  }

  private generateSuggestions(context: any): string[] {
    if (context.targetAsset) {
      return [
        `Why is ${context.targetAsset.name} calculated at this risk level?`,
        `Which downstream assets depend on ${context.targetAsset.assetCode}?`,
        `Summarize the inspection findings for this asset`,
      ];
    }
    return [
      'Show me all critical assets',
      'Which electrical assets have high risk?',
      'Which assets require urgent maintenance?',
      'List all bridges requiring inspection',
    ];
  }

  private async callGeminiApi(query: string, context: any, history: { role: string; content: string }[]) {
    const systemPrompt = `You are InfraSphere AI Assistant, an enterprise intelligence layer for public and commercial infrastructure asset management.
RULES:
1. Never invent asset data, asset codes, or hypothetical numbers.
2. Use ONLY the factual context provided below. If information is missing, explicitly state "I don't have enough data to answer that."
3. NEVER independently calculate an official risk score yourself. The official deterministic score is calculated by the Risk Service and provided in the context.
4. When explaining risk, detail:
   - Condition score and observed physical status
   - Age vs expected lifecycle
   - Inspection findings and defect severities
   - Open maintenance work orders and costs
   - Criticality and cascading dependency impact (which hospitals, schools, or water facilities depend on this asset)
5. Format your answers clearly with markdown bullet points and clean structure.

CONTEXT DATA FROM INFRASPHERE:
${JSON.stringify(context, null, 2)}
`;

    const contents: any[] = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will strictly follow all rules, ground every answer in provided system data, and never invent asset metrics.' }] });

    for (const h of history.slice(-4)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: query }],
    });

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || "I couldn't generate a response from the model.";
  }

  /**
   * Deterministic explanation engine when GEMINI_API_KEY is not configured
   */
  private generateDeterministicResponse(query: string, context: any): string {
    const lowerQuery = query.toLowerCase();

    // Specific asset queries
    if (context.targetAsset) {
      const a = context.targetAsset;
      const r = context.riskData;
      const d = context.dependencies;
      const findings = context.inspections?.flatMap((i: any) => i.findings || []) || [];

      if (lowerQuery.includes('why') || lowerQuery.includes('risk') || lowerQuery.includes('health') || lowerQuery.includes('explain')) {
        const healthScore = r?.healthScore ?? a.healthScore ?? 80;
        const riskScore = r?.riskScore ?? a.riskScore ?? 20;
        const riskLevel = r?.riskLevel || (riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW');
        const condition = a.condition;
        const criticality = a.criticality;

        return `### Risk & Health Analysis for **${a.name}** (${a.assetCode})

**Calculated Metrics (Deterministic Rule Engine):**
* **Health Score:** \`${healthScore}/100\`
* **Risk Score:** \`${riskScore}/100\` (Level: **${riskLevel}**)
* **Asset Criticality:** **${criticality}**
* **Physical Condition:** **${condition}**

**Underlying Risk Factors:**
1. **Condition & Physical Deterioration:** The asset is currently rated in **${condition}** condition.
2. **Age & Lifecycle:** Expected life is **${a.expectedLifeYears} years**, with an installation date of ${a.installationDate ? new Date(a.installationDate).toLocaleDateString() : 'N/A'}.
3. **Inspection Findings:** ${findings.length > 0 ? `There are **${findings.length} registered defects**, including ${findings.filter((f: any) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length} high/critical findings.` : 'No active critical defect findings recorded.'}
4. **Cascading Dependency Impact:** ${d?.impactAnalysis ? `If this asset fails, it will directly or indirectly impact **${d.impactAnalysis.totalAtRiskAssets} downstream assets**, including: ${d.impactAnalysis.criticalAssetsAtRisk?.join(', ') || 'none'}.` : 'No downstream asset dependencies registered.'}

*Recommendation:* Priority maintenance work order is advised based on the deterministic scoring rules.`;
      }

      if (lowerQuery.includes('depend') || lowerQuery.includes('impact') || lowerQuery.includes('fail')) {
        const d = context.dependencies;
        if (!d) return `No dependency information found for ${a.assetCode}.`;
        return `### Dependency & Failure Impact for **${a.name}** (${a.assetCode})

* **Directly Supplies / Protects:** ${d.downstream?.length || 0} downstream assets
* **Total Assets at Risk upon Failure:** ${d.impactAnalysis?.totalAtRiskAssets || 0} assets
* **Critical Dependents:** ${d.impactAnalysis?.criticalAssetsAtRisk?.length ? d.impactAnalysis.criticalAssetsAtRisk.join(', ') : 'None'}

${d.downstream?.map((item: any) => `- **${item.asset?.assetCode} (${item.asset?.name})**: Rel: \`${item.relationship}\` | Criticality: **${item.criticality}**`).join('\n') || 'No direct downstream dependents.'}`;
      }
    }

    // Broad queries: "Show me all critical assets", "Which bridges need inspection", etc.
    if (lowerQuery.includes('critical')) {
      const criticals = context.allAssetsSummary?.filter((a: any) => a.criticality === 'CRITICAL' || a.status === 'CRITICAL' || (a.riskScore && a.riskScore >= 70)) || [];
      if (criticals.length === 0) {
        return 'Currently, there are no assets categorized as CRITICAL in the system database.';
      }
      return `### Critical Infrastructure Assets Summary

Currently there are **${criticals.length} high-criticality or high-risk assets** in the system:

${criticals.map((a: any) => `- **${a.assetCode}**: ${a.name} (${a.category} / ${a.assetType}) — Risk: \`${a.riskScore ?? 75}/100\` | Health: \`${a.healthScore ?? 35}/100\` | Location: ${a.locationName}`).join('\n')}

*Recommendation:* Review scheduled inspections and ensure contingency backup procedures are active.`;
    }

    if (lowerQuery.includes('bridge') || lowerQuery.includes('transport')) {
      const transportAssets = context.allAssetsSummary?.filter((a: any) => a.category === 'TRANSPORT') || [];
      return `### Transport & Bridge Assets Status

Found **${transportAssets.length} transport assets** registered in the inventory:

${transportAssets.map((a: any) => `- **${a.assetCode}**: ${a.name} — Condition: **${a.condition}** | Health: \`${a.healthScore ?? 80}/100\` | Location: ${a.locationName}`).join('\n')}`;
    }

    return `### InfraSphere Infrastructure Assistant

I am connected to the InfraSphere live database. You can ask me:
* *"Why is transformer ELC-000001 high risk?"*
* *"Show me all critical assets."*
* *"Which assets have low health scores?"*
* *"Explain failure impact for Bhandup Water Pumping Station."*

How can I assist you with your infrastructure inventory today?`;
  }
}
