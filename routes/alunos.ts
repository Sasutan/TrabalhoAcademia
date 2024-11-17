import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from 'zod';

const prisma = new PrismaClient();

const router = Router();

const alunoSchema = z.object({
    nome: z.string(),
    fone: z.string(),
    email: z.string(),
    idade: z.number().min(12,
        { message: "Idade deve ser igual ou superior a 12 anos"}
      ),
    numTreinos: z.number().optional(),
    objetivo: z.string().optional()
})

router.get('/', async (req, res) => {
    const alunos = await prisma.aluno.findMany();
    res.status(200).json(alunos);
})

router.post('/', async (req, res) => {
    const valida = alunoSchema.safeParse(req.body)
    if(!valida.success) {
        res.status(400).json(valida.error)
        return
    }
    
    try {
        const aluno = await prisma.aluno.create({
            data: valida.data
        })
        res.status(201).json(aluno)
    } catch (error) {
        res.status(400).json({ error })
    }
})

router.delete('/:id', async (req, res) => {
   const { id } = req.params

   try {
       const aluno = await prisma.aluno.delete({
        where: { id: Number(id)}
   })
   res.status(200).json(aluno)
} catch (error) {
    res.status(400).json({ error })   
    }
  })

router.put('/:id', async (req, res) => { 
    const { id } = req.params

    const valida = alunoSchema.safeParse(req.body)
    if(!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const aluno = await prisma.aluno.update({
            where: { id: Number(id) },
            data: valida.data
        })
        res.status(200).json(aluno) 
    } catch (error) {
        res.status(400).json({ error })
    }
})

export default router;