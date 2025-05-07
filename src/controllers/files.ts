import { Request, Response, NextFunction } from 'express'
import { HttpError } from '../utils/httpError'
import fs from 'fs'
import Path from 'path'

const { FILESTORAGE_PATH = '' } = process.env

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName = '' } = req.query
    if (typeof fileName !== 'string') throw new HttpError('Bad request', 400)
    const filePath = Path.join(FILESTORAGE_PATH, fileName)
    fs.readFileSync(filePath, 'utf8')
    res.download(filePath, (err) => {
      if (err) {
        throw new HttpError('Download faild', 500)
      }
    })
  } catch (error) {
    next(error)
  }
}

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file
    if (file) res.json({ url: file.path })
    else throw new HttpError('Server Error', 500)
  } catch (error) {
    next(error)
  }
}
