import { userApi } from "@apis/index";
import ModalBase from "@components/modal";
import { locateSelector } from "@store/locate/locate.slice";
import { Alert, Checkbox, Image, InputNumber, Steps } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InfoOwner } from "src/models/user/user.model";
import { trans } from "src/resources/trans";
import { Contract } from "web3-eth-contract";


interface IProps {
    assetName: string;
    assetImage: string;
    assetLocation: string;
    numberNFT: number;
    visible: boolean;
    onCancel: () => void;
    contractCollection: Contract;
    isOpenOnSell: boolean;
    addressMarker: string;
}

export default function InfoOwnerNFTModal({
    assetName,
    assetImage,
    assetLocation,
    numberNFT,
    visible,
    onCancel,
    contractCollection,
    isOpenOnSell,
    addressMarker
}: IProps) {

    const [addressOwner, setAddressOwner] = useState('')
    const [loadingGetAddressOwner, setLoadingGetAddressOwner] = useState(false)
    const [infoOwner, setInfoOwner] = useState(new InfoOwner())
    const [loadingInfoOwner, setLoadingInfoOwner] = useState(false)
    const {locate} = useSelector(locateSelector)

    const getAddressOwner = async (nftId: number) => {
        try {
            setLoadingGetAddressOwner(true)
            let output: string = await contractCollection.methods.ownerOf(nftId).call()
            console.log("🚀 ~ file: info-owner.tsx:39 ~ getAddressOwner ~ output:", output)
            return output.toLowerCase()

        }
        catch (err) {
            console.log(err)
            return ''
        }
        finally {
            setLoadingGetAddressOwner(false)
        }
    }

    const getInfoOwner = async (address: string) => {
        try {
            setLoadingInfoOwner(true)
            let info = await userApi.getInfoUserByWallet(address)
            setInfoOwner(new InfoOwner(info))
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoadingInfoOwner(false)
        }
    }

    useEffect(() => {
        (async () => {
            if (numberNFT && contractCollection && visible) {
                if (!!isOpenOnSell){
                    setAddressOwner(addressMarker)
                    await getInfoOwner(addressMarker)
                }
                else{
                    let _addressOwner = await getAddressOwner(numberNFT)
                    setAddressOwner(_addressOwner)
                    await getInfoOwner(_addressOwner)
                }
               
            }
        })()
    }, [numberNFT, contractCollection, isOpenOnSell, visible])

    const copy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <>
            <ModalBase visible={visible} width={500} onCancel={() => { onCancel() }}>
                <div className="bg-white w-100 p-3 modal-trade--container">
                    <h4 className="text-center">
                        {trans[locate].owner_information}
                    </h4>
                    <div className="content">
                        <div className="info">
                            <Image
                                src={assetImage}
                                alt="image asset"
                                height={75}
                                style={{
                                    borderRadius: 5,
                                    width: 100,
                                    aspectRatio: '4/3'
                                }}
                            />
                            <div>
                                <h6 className="name">
                                    {assetName}
                                </h6>
                                <div>
                                    <i className="fa-light fa-location-dot me-1"></i>
                                    <span style={{ color: '#4D5461' }}>
                                        {assetLocation}
                                    </span>
                                </div>
                                <div>
                                    <span className="me-1">
                                        {trans[locate].product_order_number}:
                                    </span>
                                    <span style={{ color: 'red' }}>
                                        {numberNFT}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="owner mt-3">
                            {infoOwner.email ? (
                                <>
                                    <h6 className="d-flex gap-2 mb-1">
                                        <span style={{
                                            color: '#4D5461'
                                        }}>
                                            {trans[locate].fullname}:
                                        </span>
                                        <span style={{ color: '#363636', fontWeight: 700 }}>{infoOwner.name}</span>
                                    </h6>
                                    <h6 className="d-flex gap-2 mb-1">
                                        <span style={{
                                            color: '#4D5461'
                                        }}>
                                            {trans[locate].email}:
                                        </span>
                                        <span style={{ color: '#363636', fontWeight: 700 }}>{infoOwner.email}</span>
                                    </h6>
                                    <h6 className="d-flex gap-2 mb-1">
                                        <span style={{
                                            color: '#4D5461'
                                        }}>
                                            {trans[locate].join_date}:
                                        </span>
                                        <span style={{ color: '#363636', fontWeight: 700 }}>{moment(infoOwner.createdAt).format('DD/MM/YYYY')}</span>
                                    </h6>
                                    <h6 className="d-flex gap-2 mb-1">
                                        <span style={{
                                            color: '#4D5461'
                                        }}>
                                            {trans[locate].address_wallet}:
                                        </span>
                                        <span style={{ color: '#363636', fontWeight: 700 }}>{addressOwner.slice(0, 4)}...{addressOwner.slice(-4)}</span>
                                        <a onClick={() => {
                                            copy(addressOwner)
                                        }} role={'button'}>
                                            <i className="fa-regular fa-copy"></i>
                                        </a>
                                    </h6>
                                </>
                            ) : (
                                <Alert message={trans[locate].user_unregistered_address} type="warning" />
                            )}
                        </div>
                    </div>
                </div>
            </ModalBase>
        </>
    )
}