import Transaction from '../models/Transaction';
import Category from '../models/Category';
import path from 'path'
import fs from 'fs'
import uploadConfig from '../config/upload'
import { getRepository, In, TransactionRepository } from 'typeorm';
import csvParse  from 'csv-parse'


interface CSVTransaction{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute( csvFilename:string ): Promise<Transaction[]> {

    const categoriesRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);
    const csvFilePath = path.join(uploadConfig.directory, csvFilename);

    const transactions : CSVTransaction[] = [];
    const categories :  string[] = [];
    

    const contactReadStream = fs.createReadStream(csvFilePath)
    const parsers = csvParse({
      from_line:2,
    });

    const parseCSV = contactReadStream.pipe(parsers);
    parseCSV.on('data',async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      );

      if (!title || !type || !value ) return;

      categories.push(category);
      transactions.push({ title, type, value, category });

    })

    await new Promise(resolve => parseCSV.on('end',resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenteCategoriesTitle = existentCategories.map( (category : Category) => category.title)
    
    const addCategoryTitles = categories.filter(
      category => !existenteCategoriesTitle.includes(category),
    ).filter(
      (value, index, self) => self.indexOf(value) === index
    );

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title =>({
        title,
      })),
    )

    await categoriesRepository.save(newCategories);
    
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    //await fs.promises.unlink(csvFilename)  

    return createdTransactions

  }
}

export default ImportTransactionsService;
