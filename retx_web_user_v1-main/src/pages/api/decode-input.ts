// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import abiDecoder from 'abi-decoder'
import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  let abi = req.body.abi;
  abi = JSON.parse(abi)
  abiDecoder.addABI(abi);

  let input = req.body.input
  const decodedData = abiDecoder.decodeMethod(input);

  res.status(200).json(decodedData)
}
