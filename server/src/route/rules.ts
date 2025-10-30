import express from 'express'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()
const router = express.Router()

// List rules by org
router.get('/', async (req, res) => {
  const orgId = String(req.query.orgId || '')
  if (!orgId) return res.status(400).json({ error: 'orgId is required' })
  const rules = await prisma.rule.findMany({ where: { orgId }, orderBy: { priority: 'asc' } })
  res.json(rules)
})

// Create a rule
router.post('/', async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type must be application/json' })
  const body = req.body || {}
  const { orgId, name, conditions, actions, priority, active } = body
  if (!orgId || !name || !Array.isArray(conditions)) {
    return res.status(400).json({ error: 'orgId, name, conditions[] are required' })
  }
  const created = await prisma.rule.create({
    data: {
      orgId: String(orgId),
      name: String(name),
      conditions: conditions,
      actions: Array.isArray(actions) ? actions.map(String) : [],
      priority: Number.isFinite(priority) ? Number(priority) : 1,
      active: active === undefined ? true : Boolean(active),
    },
  })
  res.status(201).json(created)
})

// Delete a rule
router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    await prisma.rule.delete({ where: { id } })
    res.status(204).end()
  } catch {
    res.status(404).json({ error: 'Rule not found' })
  }
})

// Toggle active
router.patch('/:id/active', async (req, res) => {
  const id = req.params.id
  const rule = await prisma.rule.findUnique({ where: { id } })
  if (!rule) return res.status(404).json({ error: 'Rule not found' })
  const updated = await prisma.rule.update({ where: { id }, data: { active: !rule.active } })
  res.json(updated)
})

export default router


