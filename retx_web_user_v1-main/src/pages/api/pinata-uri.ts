import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let {data} = await axios.get(`https://${process.env.GATEWAY_PINATA}/ipfs/${req.query.cid}`)
    res.status(200).json(data)
}