import ModalBase from "@components/modal";
import { locateSelector } from "@store/locate/locate.slice";
import { Checkbox, Image, InputNumber, Steps } from "antd";
import { useSelector } from "react-redux";
import { trans } from "src/resources/trans";


interface IProps{
    assetName: string;
    assetAddress: string;
    assetLocation: string;
    numberNFT: number;
    assetImage: string;
}

export default function TempNFTModal({assetImage}: IProps) {
    const {locate} = useSelector(locateSelector)

    const handleOk = () => {
        // setIsModalOpen(false);
    };

    const handleCancel = () => {
        // setIsModalOpen(false);
    };

    return (
        <>
            <ModalBase visible={true} width={500} onCancel={() => { }}>
                <div className="bg-white w-100 p-3 modal-trade--container">
                    <h4 className="text-center">Bán</h4>
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
                                    Biệt thự liền kề
                                </h6>
                                <div>
                                    <i className="fa-light fa-location-dot me-1"></i>
                                    <span style={{ color: '#4D5461' }}>
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, incidunt!
                                    </span>
                                </div>
                                <div>
                                    <span className="me-1">
                                        {trans[locate].product_order_number}:
                                    </span>
                                    <span style={{ color: 'red' }}>
                                        15
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="price">
                            <div className="desired-price-input">
                                <div className="head">
                                    <span>Giá bán mong muốn</span>
                                    <span style={{ color: '#9EA3AE' }}>{trans[locate].balance}: <span style={{ color: "#111" }}>{(200000000).toLocaleString('vi-VN')}đ</span></span>
                                </div>
                                <div className="input">
                                    <InputNumber min={1}
                                        size='large'
                                        style={{
                                            width: '100%'
                                        }}
                                        addonAfter={(<span>VND</span>)}
                                    />
                                </div>
                            </div>
                            <div>
                                <span style={{ color: '#9EA3AE' }} >{trans[locate].transaction_fee}: </span>
                                <span >100,000đ (2.5%)</span>
                            </div>
                            <div>
                                <span style={{ color: '#9EA3AE' }} >{trans[locate].transaction_fee}: </span>
                                <span>999999999đ</span>
                            </div>
                        </div>
                        <div className="confirm">
                            <div>
                                <Checkbox>Tôi {trans[locate].confirm} đồng ý và tuân thủ <a href="http://" target={'_blank'}>chính sách</a> của RETX </Checkbox>
                            </div>
                            <div className="d-flex gap-3 mt-2">
                                <button className="btn btn-orange w-50" >
                                    Uỷ quyền
                                </button>
                                <button className="btn btn-orange w-50" disabled >
                                    Rao bán
                                </button>
                            </div>
                            <div className="mt-3 mx-auto" style={{width: 'calc(100% / 2 + 50px)'}}>
                                <Steps
                                    current={0}
                                    items={[
                                        {
                                            title: '',
                                        },
                                        {
                                            title: '',
                                        },
                                    ]} />
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBase>
        </>
    )
}