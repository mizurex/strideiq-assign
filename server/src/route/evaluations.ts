import express from 'express'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()
const router = express.Router()

// GET /evaluations?orgId=123&limit=10
router.get('/', async (req, res) => {
  const orgId = req.query.orgId ? String(req.query.orgId) : undefined
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 50) : 10

  try {
    const where = orgId ? { orgId } : {}
    const evaluations = await prisma.evaluation.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      take: Number.isFinite(limit) && limit > 0 ? limit : 10,
    })
    res.json(evaluations)
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
