import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

console.log("Prisma Client initialized");
export interface Condition {
  field: string;
  operator: string; 
  value: number | string | boolean | null;
  category: string;
}

export interface Rule {
  id: string;
  orgId: string;
  name: string;
  conditions: any; 
  actions: string[];
  active: boolean;
}

function checkExpense(expense: Record<string, unknown>, rule: Rule): boolean {
  const conditions = rule.conditions as Condition[]; 

  if (!Array.isArray(conditions)) return false; 

  for (const cond of conditions) { 
    const t  = cond.field;
    const v = cond.category;
    const expenseValue = expense[t]; // expense["amount"] 
   

    if (expenseValue === undefined) return false;


  let matched = false;

    switch (cond.operator) {
      case ">":
        matched = Number(expenseValue) > Number(cond.value); 
        break;
      case "<":
        matched = Number(expenseValue) < Number(cond.value); 
        break;
      case ">=":
        matched = Number(expenseValue) >= Number(cond.value); // 2500 >= 1000
        break;
      case "<=":
        matched = Number(expenseValue) <= Number(cond.value); 
        break;
      default:
        matched = false;
    }

    if (!matched) return false;
  }

  return true;
}


export async function evaluatePolicy(orgId: string, expense: Record<string, unknown>) {
    //find the org
  const rules: Rule[] = await prisma.rule.findMany({
    where: { orgId, active: true },
  });

  const matchedRules: Rule[] = [];
  const trace: any[] = [];

  for (const rule of rules) {
    const isMatch = checkExpense(expense, rule); // current rule suppose r1 is true 


      function conditionsToReadable(conditions: Condition[]): string {
        return conditions
          .map(c => `${c.field} ${c.operator} ${c.value}`)
          .join(' && ')
      }
      const readableConditions = conditionsToReadable(rule.conditions as Condition[]); 

    trace.push({
      rule: rule.name,
      matched: isMatch,
      action: rule.actions,
      reason: isMatch
        ? `${readableConditions}`
        : `Failed : ${readableConditions}`,
    });

    if (isMatch) matchedRules.push(rule);
  }

  matchedRules.sort((a, b) => {
    const aCount = a.conditions ? a.conditions.length : 0;
    const bCount = b.conditions ? b.conditions.length : 0;
    return bCount - aCount; // fidn the rule with most conditions
  });


  const winningRule = matchedRules[0];
  const actions = winningRule ? winningRule.actions : [];
  const matchedRuleNames = matchedRules.map((r) => r.name);
  await prisma.evaluation.create({ //populate the evaluation table
    data: {
      orgId,
      expense: JSON.stringify(expense),
      matchedRules: matchedRuleNames,
      actions,
      trace,
    },
  });

  return {
    matched_rules: matchedRuleNames,
    winning_rule: winningRule ? winningRule.name : null,
    actions,
    trace,
  };
}
