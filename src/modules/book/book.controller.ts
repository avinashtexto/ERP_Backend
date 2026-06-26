import type { Request, Response } from 'express';

import { bookBaseSchema } from './book.dto.js';
import * as service from './book.service.js';

export async function health(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.health();
    res.build
      .withStatus(200)
      .withModule('book')
      .withMessage('Book module health check successful')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withModule('book')
      .withError('HEALTH_CHECK_FAILED', error.message)
      .fail()
      .send();
  }
}

export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 100;
    const result = await service.getAllBooks(page, pageSize);
    res.build
      .withStatus(200)
      .withModule('book')
      .withMessage('Book list retrieved successfully')
      .withData(result.data)
      .withMeta({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      })
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withModule('book')
      .withError('GET_BOOKS_FAILED', error.message)
      .fail()
      .send();
  }
}

export async function getBookNames(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 100;
    const result = await service.getBookNames(page, pageSize);
    res.build
      .withStatus(200)
      .withModule('book')
      .withMessage('Book names retrieved successfully')
      .withData(result.data)
      .withMeta({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      })
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withModule('book')
      .withError('GET_BOOK_NAMES_FAILED', error.message)
      .fail()
      .send();
  }
}

export async function createBook(req: Request, res: Response): Promise<void> {
  try {
    const parsed = bookBaseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withModule('book')
        .withError('INVALID_INPUT', parsed.error.format())
        .fail()
        .send();
      return;
    }

    const data = await service.createBook(parsed.data);
    res.build
      .withStatus(201)
      .withModule('book')
      .withMessage('Book created successfully')
      .withData(data)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withModule('book')
      .withError('CREATE_BOOK_FAILED', error.message)
      .fail()
      .send();
  }
}
