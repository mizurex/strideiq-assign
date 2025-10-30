import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import policiesRouter from './route/policies'
import rulesRouter from './route/rules'
import evaluationsRouter from './route/evaluations'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.get('/api/ping', (req, res) => {
  res.json({ message: "OK" })
})
app.use('/policies', policiesRouter);
app.use('/rules', rulesRouter);
app.use('/evaluations', evaluationsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})