import { useEffect, useState } from "react";

type Condition = {
  field: string;
  operator: string;
  value: number;
};

type Rule = {
  id: string;
  orgId: string;
  name: string;
  conditions: Condition[];
  actions: string[];
  active: boolean;
};


const API_BASE = "http://localhost:3000";

function RulesManager() {
  const [orgId, setOrgId] = useState("123");
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    field: "amount",
    operator: ">",
    value: "",
    actions: "flag",
    active: true,
  });
  const [cond, setCond] = useState({ field: "amount", operator: ">", value: "" });
  const [conditionsDraft, setConditionsDraft] = useState<Condition[]>([]);

  const formatConditions = (conditions: Condition[]): string =>
    !Array.isArray(conditions) || conditions.length === 0
      ? "-"
      : conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(" && ");

  const parseValue = (input: string): number => {
    const trimmed = input.trim();
    const num = Number(trimmed);
    return !Number.isNaN(num) && trimmed !== "" ? num : 0;
  };

  async function fetchRules(o: string) {
    if (!o) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/rules?orgId=${encodeURIComponent(o)}`)
      .then(async (res) => {
        if (!res.ok) {
          setError(`Load failed ${res.status}`)
          return
        }
        const data: Rule[] = await res.json()
        setRules(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRules(orgId);
  }, [orgId]);

  function addCondition() {
    if (!cond.field || !cond.operator || String(cond.value).trim() === "") {
      setError("Please fill field, operator, and value");
      return;
    }
    setError(null);
    setConditionsDraft(prev => [...prev, { field: cond.field, operator: cond.operator, value: parseValue(String(cond.value)) }]);
    setCond({ field: "", operator: ">", value: "" });
  }

  function removeCondition(index: number) {
    setConditionsDraft(prev => prev.filter((_, i) => i !== index));
  }

  async function createRule() {
    setError(null);

      const conditions = conditionsDraft.length > 0
        ? conditionsDraft
        : [{ field: form.field || "amount", operator: form.operator || ">", value: parseValue(form.value) }];

      const body = {
        orgId,
        name: form.name || "Untitled",
        conditions,
        actions: form.actions ? [form.actions.trim()] : [],
        active: !!form.active,
      };
      const res = await fetch(`${API_BASE}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Create failed");
      setForm({ name: "", field: "amount", operator: ">", value: "", actions: "flag", active: true });
      setConditionsDraft([]);
      fetchRules(orgId);
      
    
  }

  async function deleteRule(id: string) {
    setError(null)
    const res = await fetch(`${API_BASE}/rules/${id}`, { method: "DELETE" })
    if (!res.ok && res.status !== 204) {
      setError("Delete failed")
      return
    }
    setRules(rules.filter((r) => r.id !== id))
  }

  async function toggleRule(id: string) {
    setError(null)
    const res = await fetch(`${API_BASE}/rules/${id}/active`, { method: "PATCH" })
    if (!res.ok) {
      setError("Toggle failed")
      return
    }
    const updated: Rule = await res.json()
    setRules(rules.map((r) => (r.id === id ? updated : r)))
  }

  return (
    <div className="space-y-4 max-w-8xl">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">
          Rules
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center flex-wrap gap-3">
            <label className="text-sm font-medium">Org ID</label>
            <input
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={() => fetchRules(orgId)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>

          <div className="flex flex-wrap gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
          </div>

          <div className="text-sm font-medium mt-2">Add conditions</div>
          <div className="flex flex-wrap gap-3 items-center">
            <input placeholder="Field" value={cond.field} onChange={(e) => setCond({ ...cond, field: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <select value={cond.operator} onChange={(e) => setCond({ ...cond, operator: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
            </select>
            <input placeholder="Value" value={cond.value} onChange={(e) => setCond({ ...cond, value: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <button onClick={addCondition} className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800">Add condition</button>
          </div>

          {conditionsDraft.length > 0 && (
            <div className="mt-2 border border-gray-100 rounded-lg">
              {conditionsDraft.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 border-t first:border-t-0">
                  <div className="text-sm">{c.field} {c.operator} {String(c.value)}</div>
                  <button onClick={() => removeCondition(i)} className="px-2 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-50">Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center mt-3">
            <select value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} className="border border-gray-300 rounded-md px-2 py-1 text-sm w-40">
              <option value="flag">flag</option>
              <option value="approve">approve</option>
              <option value="reject">reject</option>
              <option value="halt">halt</option>
            </select>
      
            <button onClick={createRule} className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800">Create rule</button>
          </div>

          <div className="border border-gray-100 rounded-lg">
            <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_auto] text-sm text-gray-500 px-3 py-2 border-b">
              <div className="font-bold">Name</div>
              <div className="font-bold">Conditions</div>
              
              <div className="mr-55 font-bold">Action</div>
            </div>
            {rules.map((r) => (
              <div key={r.id} className="grid grid-cols-[1.2fr_2fr_1fr_1fr_auto] text-sm items-center px-3 py-2 border-t">
                <div className="flex gap-2 items-center">
                  <span className="font-bold">{r.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${r.active ? "bg-black text-white" : "bg-gray-50 text-gray-700 border-gray-200"}`}>
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="font-bold">{formatConditions(r.conditions)}</div>
                <div className="font-bold">{r.actions.join(", ") || "-"}</div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => toggleRule(r.id)} className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deleteRule(r.id)} className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {rules.length === 0 && <div className="p-3 text-sm text-gray-500">No rules yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestPanel() {
  const [orgId, setOrgId] = useState("123");
  const [payload, setPayload] = useState(`{
  "orgId": "123",
  "expense": {
    "expense_id": "exp_1",
    "amount": 2500,
    "category": "Food",
    "working_hours": 13
  }
}`);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function evaluate() {
    setError(null)
    setResult(null)
    const body = JSON.parse(payload)
    const res = await fetch(`${API_BASE}/policies/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError(`Request failed ${res.status}`)
      return
    }
    const data = await res.json()
    setResult(data)
  }

  

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">
          Test
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center flex-wrap gap-3">
            <label className="text-sm font-medium">Org ID</label>
            <input
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <button onClick={evaluate} className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800">
              Evaluate
            </button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm border border-gray-300 rounded-md p-2 bg-white text-gray-800"
          />
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <div className="font-semibold text-sm mb-2">Response</div>
            <pre className="text-sm whitespace-pre-wrap break-words">
              {result ? JSON.stringify(result, null, 2) : "—"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="max-w-6xl mx-auto px-6 py-6 border-b border-gray-200 flex justify-between items-baseline">
        <h1 className="text-2xl font-semibold">StrideIQ Admin</h1>
        <span className="text-sm text-gray-500">Rules and Test</span>
      </header>
      <main className="max-w-8xl mx-auto px-6 py-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <RulesManager />
          <TestPanel />
        </div>
        <RecentEvaluations />
      </main>
    </div>
  );
}

function RecentEvaluations() {
  const [orgId, setOrgId] = useState("123")
  const [items, setItems] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const url = orgId ? `${API_BASE}/evaluations?orgId=${encodeURIComponent(orgId)}&limit=10` : `${API_BASE}/evaluations?limit=10`
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          setError(`Load failed ${res.status}`)
          return
        }
        const data = await res.json()
        setItems(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">Recent Evaluations</div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium">Org ID</label>
            <input value={orgId} onChange={e => setOrgId(e.target.value)} className="px-2 py-1 border border-gray-300 rounded-md text-sm" />
            <button onClick={load} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Refresh</button>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
          <div className="border border-gray-100 rounded-lg">
            <div className="grid grid-cols-[1fr_1fr_1fr] text-sm text-gray-500 px-3 py-2 border-b">
              <div className="font-bold">Expense</div>
           
            </div>
            <div className="max-h-80 overflow-auto">
              {items.map((e, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr] text-sm px-3 py-2 border-t">
                  <div className="whitespace-pre-wrap break-words">{(e as { expense: string }).expense}</div>
            
                </div>
              ))}
              {items.length === 0 && <div className="p-3 text-sm text-gray-500">No evaluations yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
