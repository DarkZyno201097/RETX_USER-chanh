import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Web3 from "web3"
import { Contract } from "web3-eth-contract"

import { contractSelector } from "@store/contract/contract.slice"


export default function UnitPrice ({address}) {
    const [web3, setWeb3] = useState(null)
    const [unitPrice, setUnitPrice] = useState(0)
    const {
        infoContract,
        web3Contract,
        loadedInfoContracts
    } = useSelector(contractSelector)


    const getUnitPrice = async (assetAddress: string) => {
        try {
            let input_in = await web3Contract.pancakeRouter.methods.getAmountsIn(
                BigInt('1').toString(),
                [assetAddress, infoContract.stableCoin.address].reverse()
            ).call()
            let priceBigInt = BigInt(input_in[0])
            setUnitPrice(parseFloat(priceBigInt.toString()))
        }
        catch (err) {
            console.log("ratePrice in product-item.tsx", err)
        }
    }

    useEffect(()=>{
        (async ()=>{
            if (address && loadedInfoContracts)
            await getUnitPrice(address)
        })()
    },[address, loadedInfoContracts])


    return (
        <>
            {unitPrice}
        </>
    )

}