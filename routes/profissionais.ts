import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from 'zod';

const prisma = new PrismaClient();

const router = Router();

const profissionalSchema = z.object({
    nome: z.string(),
    especialidade: z.string(),
    dataNasc: z.string().date()    
});

router.get('/', async (req, res) => {
    const profissionais = await prisma.profissional.findMany();
    res.status(200).json(profissionais);
})

router.post('/', async (req, res) => {
    const valida = profissionalSchema.safeParse(req.body)
    if(!valida.success) {
        res.status(400).json(valida.error)
        return
    }
    
    try {
        const profissional = await prisma.profissional.create({
            data: {...valida.data,
                dataNasc: valida.data.dataNasc + "T00:00:00Z"}
        })
        res.status(201).json(profissional)
    } catch (error) {
        res.status(400).json({ error })
    }
})

router.delete('/:id', async (req, res) => {
   const { id } = req.params

   try {
       const profissional = await prisma.profissional.delete({
        where: { id: Number(id)}
   })
   res.status(200).json(profissional)
} catch (error) {
    res.status(400).json({ error })   
    }
  })

router.put('/:id', async (req, res) => {
    const { id } = req.params

    const valida = profissionalSchema.safeParse(req.body)
    if(!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const profissional = await prisma.profissional.update({
            where: { id: Number(id) },
            data: {...valida.data,
                dataNasc: valida.data.dataNasc + "T00:00:00Z"}
        })
        res.status(200).json(profissional)
    } catch (error) {
        res.status(400).json({ error })
    }
})


export default router;