import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm'; 
import TransactionsRepository from '../repositories/TransactionsRepository'
import Transaction from '../models/Transaction';
import Category from '../models/Category';



interface RequestDTO{
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

 

class CreateTransactionService {
  public async execute({title,value, type, category}: RequestDTO): Promise<Transaction> {
    
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type != 'income' &&  type != 'outcome' ){
      throw new AppError('Invalid Type, choose income or outcome.',400)
    }

    const { total }  = await transactionRepository.getBalance();

    if (type === "outcome" && total < value){
      throw new AppError('Insuficient funds.',400)
    }

    let transactionCategory = await categoryRepository.findOne({where:{title: category,}})
   
    if (!transactionCategory){
      transactionCategory = categoryRepository.create({ title: category,})
      await categoryRepository.save(transactionCategory);
    }
    

    const transaction = transactionRepository.create({
      title,
      value,
      category_id: transactionCategory.id,
      type,
    });
    await transactionRepository.save(transaction);

    return transaction

  }
}

export default CreateTransactionService;
