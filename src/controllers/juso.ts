import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
const { JUSO_CONFM_KEY } = process.env

export const juso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPage, countPerPage, keyword } = req.query
    const { data: result } = await axios.get(
      `http://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${JUSO_CONFM_KEY}&currentPage=${currentPage}&countPerPage=${countPerPage}&keyword=${keyword}&resultType=json`,
      {},
    )
    res.status(201).json({ message: result })
  } catch (err) {
    next(err)
  }
}
