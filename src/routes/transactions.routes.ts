import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload'

import TransactionsRepository from '../repositories/TransactionsRepository'
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository)
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance
  })
});

transactionsRouter.post('/', async (request, response) => {

  const { title,value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const trasnaction = await createTransaction.execute({title,value, type, category})

  return response.json(trasnaction)
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id)

  return response.status(204).json({})
});

transactionsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionRepository = getCustomRepository(TransactionsRepository)
  const transaction = await transactionRepository.findOne({where:{id,},}); 

  return response.json(transaction )

});

transactionsRouter.post('/import',upload.single('file'), async (request, response) => {
  
  const importTransactionsService = new ImportTransactionsService();
  const transactions = await importTransactionsService.execute(request.file.filename);
 
  return response.json(transactions);
});

export default transactionsRouter;
