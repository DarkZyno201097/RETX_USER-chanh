import ModalBase from "@components/modal";
import { alertActions } from "@store/actions";
import { locateSelector } from "@store/locate/locate.slice";
import { Image } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trans } from "src/resources/trans";

interface IProps {
  visible: boolean;
  transactionHash: string;
  onCancel: () => void;
}

export default function SuccessModal({
  visible,
  transactionHash,
  onCancel,
}: IProps) {
  const dispatch = useDispatch();
  const { locate } = useSelector(locateSelector);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    // dispatch(alertActions.alertSuccess(trans[locate].copy_successfully))
  };

  return (
    <>
      <ModalBase visible={visible} width={400} onCancel={onCancel}>
        <div className="bg-white w-100 p-3 modal-result-trade--container">
          <h4 className="text-center">{trans[locate].trading_results}</h4>

          <div className="content">
            <div className="my-3">
              <Image
                preview={false}
                src="/img/icon-check.svg"
                height={100}
                width={100}
              />
            </div>

            <a
              href={`https://testnet.bscscan.com/tx/${transactionHash}`}
              target="_blank"
              role="button"
            >
              <h4 style={{ color: "#34306A", fontWeight: 700 }}>
                {trans[locate].view_transactions}
              </h4>
            </a>
            <div className="w-75 text-center">
              <h6 style={{ color: "#34306A" }}>
                {trans[locate].trading_code}:
                <span style={{ color: "#6C727F", marginLeft: 5 }}>
                  {transactionHash?.slice(0, 4)}...{transactionHash?.slice(-4)}
                </span>
                <a
                  onClick={() => {
                    copy(transactionHash);
                  }}
                  className="copy a-none"
                  role="button"
                >
                  <i className="fa-regular fa-copy"></i>
                </a>
              </h6>
            </div>
            <button
              onClick={onCancel}
              className="btn btn-orange w-50 d-flex justify-content-center gap-3 py-2 mb-2"
            >
              {trans[locate].close}
            </button>
          </div>
        </div>
      </ModalBase>
    </>
  );
}
