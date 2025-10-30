# Design Note - StrideIQ Policy Engine

## Rule Representation & DSL

We use a simple JSON-based condition format for info retirival and creating:
```json
{
  "orgId": "123",
  "expense": {
    "amount": 2600,
    "working_hours": 13
  }
}
--------------
{
  "orgId": "123",
  "name": "Flag if amount > 2000 and working_hours > 12",
  "conditions": [
    { "field": "amount", "operator": ">", "value": 2000 },
    { "field": "working_hours", "operator": ">", "value": 12 }
  ],
  "actions": ["flag"],
  "active": true
}
```
For storing the data in database

```json
model 
  id          
  orgId       
  name       
  conditions  Json     Json <-    
  actions      
  priority   
  active      

model Evaluation 
  id                
  orgId        
  expense      
  matchedRules 
  actions      
  trace        Json <- 
  createdAt    

```

**Why this approach?**
- Easy to store in database as JSON
- Simple to extend with new fields without schema changes
- Converts to human-readable: `amount > 2000`


**Supported operators:** `>`, `<`, `>=`, `<=`, `==`...

---

## Tradeoffs & Limitations

**Current limitations:**
1. **No complex expressions** 
2. **No time-based rules** 


**Future improvements:**
- Expression parser for complex logic (e.g., `(amount > 100 AND category == "Food") OR (amount > 5000)`)
- Time ranges in conditions

---

## Implementation Details

**Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL + React

**Engine:** Simple matcher loops through rules, checks conditions, collects actions.

**Audit:** Every evaluation logged with matched rules + trace for debugging.