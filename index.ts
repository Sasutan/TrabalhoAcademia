import express from 'express';
import routesAlunos from './routes/alunos';
import routesProfissionais from './routes/profissionais';
import routesTreinos from './routes/treinos';

const app = express()
const port = 3000

app.use(express.json())

app.use('/alunos', routesAlunos)
app.use('/profissionais', routesProfissionais)
app.use('/treinos', routesTreinos)

app.get('/', (req, res) => {
    res.send('Api Academia!')
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})