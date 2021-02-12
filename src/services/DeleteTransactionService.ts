import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import UUIdValidator from 'uuid-validate';

class DeleteTransactionService {
  public async execute(id:string): Promise<void> {

    const isValidUUId = UUIdValidator(id);
    if (!isValidUUId){
      throw new AppError('Invalid uuid.',400)
    }

    const transactionRepository = getRepository(Transaction)
    const transaction = await transactionRepository.findOne({ where:{id:id,}})
 
    if (!transaction){
      throw new AppError('Transaction not found.',400)
    }

    try {
      console.log('vai deletar');
      await transactionRepository.delete(id);  

    } catch (error) {
      throw new AppError('Error deelting transactio',500)
    }

  }
}

export default DeleteTransactionService;
