import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from 'zod';
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const router = Router();

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
        user: "3bf0836e42c6c2",
        pass: "ac5ccb4cdae398",
    }
})

const treinoSchema = z.object({
    data: z.string().datetime().optional(),
    descricao: z.string(),
    alunoId: z.number(),
    profissionalId: z.number()
})

async function enviaEmail(email: string, nome: string, descricao: string, profissional: string) {
    let mensagem = "<h3>Relatório Academia!</h3>"
    mensagem += `<h4>Olá, ${nome}</h4>`
    mensagem += `<h4>Você fez o seguinte Treino: ${descricao}</h4>`
    mensagem += `<h4>Orientado pelo Seguinte Profissional: ${profissional}</h4>`


const info = await transporter.sendMail({
    from: '"Academia Avenida Vila Real" <acadvilarealav@gmail.com>',
    to: email,
    subject: "Relatório Academia",
    text: "Seu Diário de Treino",
    html: mensagem,
})

console.log("Message sent: %s", info.messageId)
}
    
router.get('/', async (req, res) => {
  try {
    const treinos = await prisma.treino.findMany({ 
        include: { 
            aluno: true,
            profissional: true
         } 
        })
    res.status(200).json(treinos)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.post('/', async (req, res) => {
    const valida = treinoSchema.safeParse(req.body)
    if(!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    try {
        const [treino, aluno] = await prisma.$transaction([
            prisma.treino.create({ data: valida.data }),
            prisma.aluno.update({
                where: { id: valida.data.alunoId },
                data: { numTreinos: { increment: 1 } }
            })
        ])

        const dadoAluno = await prisma.aluno.findUnique(
            { where: { id: valida.data.alunoId } })
        const dadoProfissional = await prisma.profissional.findUnique(
            { where: { id: valida.data.profissionalId } })

        enviaEmail(
            dadoAluno?.email as string,
            dadoAluno?.nome as string,
            treino?.descricao as string,
            dadoProfissional?.nome as string
        )

        res.status(201).json({ treino, aluno })
    } catch (error) {
        res.status(400).json({ error })
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const dadoTreino = await prisma.treino.findUnique({ where: { id: Number(id) } })
        
        const [treino, aluno] = await prisma.$transaction([
            prisma.treino.delete({ where: { id: Number(id) } }),
            prisma.aluno.update({
                where: { id: dadoTreino?.alunoId },
                data: { numTreinos: { decrement: 1 } }
            })
        ])
        res.status(200).json(treino)
    } catch (error) {
        res.status(400).json({ error })
    }
})

export default router