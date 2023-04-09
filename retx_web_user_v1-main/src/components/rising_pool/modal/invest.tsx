import ModalBase from "@components/modal";
import { contractSelector } from "@store/contract/contract.slice";
import { Checkbox, Image, Input, InputNumber, Steps } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import { authSelector } from "@store/auth/auth.slice";
import { useMetaMask } from "metamask-react";
import { alertActions } from "@store/actions";
import { trans } from "src/resources/trans";
import { locateSelector } from "@store/locate/locate.slice";
import { CircleSpinner } from "react-spinners-kit";
import { Contract } from "web3-eth-contract";
import { InfoCmd } from "src/models/nft.model";
import { routeNames } from "@utils/router";
import { convertFormattedNumberToNumber } from "@utils/number";
import { PoolInfo, PoolStatus } from "src/models/rising-pool.model";

interface IProps {
  assetId: string;
  assetImage: string;
  assetName: string;
  assetLocation: string;
  assetSymbol: string;
  poolInfo: PoolInfo;
  poolStatus: PoolStatus;
  contractPool: Contract;
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: { transactionHash: string }) => void;
}

export default function InvestRisingPoolModal({
  assetId,
  assetImage,
  assetName,
  assetLocation,
  assetSymbol,
  poolInfo,
  poolStatus,
  contractPool,
  visible,
  onCancel,
  onSuccess,
}: IProps) {
  const dispatch = useDispatch();
  const { balance, web3Contract, infoContract } = useSelector(contractSelector);
  const { locate } = useSelector(locateSelector);
  const { user, authenticated } = useSelector(authSelector);
  const { status, account } = useMetaMask();
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [errors, setErrors] = useState({});
  const [approved, setApproved] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);
  const [fee, setFee] = useState(0);
  const [loadingAllowance, setLoadingAllowance] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [stepCurrent, setStepCurrent] = useState(-1);
  const [maxAssetBalance, setMaxAssetBalance] = useState(null);
  const [assetAmount, setAssetAmount] = useState<number>(null);
  const [mvndAmount, setMvndAmount] = useState(0);
  const [loadingInvest, setLoadingInvest] = useState(false);

  useEffect(() => {
    (async () => {
      if (visible && contractPool) {
        let poolBalance = await contractPool.methods.getPoolBalance().call();
        setMaxAssetBalance(parseFloat(poolBalance?.asset_balance));

        await isApproveStableCoin();
        setAgreePolicy(false);
        setErrors({});
        setAssetAmount(null);
        setMvndAmount(0);
      }
    })();
  }, [visible, contractPool]);

  useEffect(() => {
    if (contractPool && web3Contract.stableCoin) {
      const timeOutId = setTimeout(async () => {
        try {
          setLoadingFee(true);
          // calc mvnd amount
          let _mvndAmount = assetAmount * poolStatus.unit_price;

          setMvndAmount(_mvndAmount);

          // load fee mvnd
          let _fee = await contractPool.methods.getInvestFeeRate().call();
          _fee = parseFloat(_fee)
          setFee((_fee* _mvndAmount) / 1000);

          await isApproveStableCoin(_mvndAmount + _fee);
        } catch (e) {
          setFee(0);
          console.log("Error", e);
        } finally {
          setLoadingFee(false);
          setErrors({});
        }
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [contractPool, assetAmount]);

  const validate = () => {
    let errors = {};
    if (assetAmount < 1) {
      errors["assetAmount"] = trans[locate].minimum_price_is.replace(
        ":amount",
        "1"
      );
    } else if (assetAmount > maxAssetBalance) {
      errors["assetAmount"] = "Vượt số dư pool";
    }
    if (mvndAmount > balance) {
      errors["price"] = trans[locate].insufficient_balance;
    }
    if (!agreePolicy) {
      errors["agreePolicy"] = trans[locate].you_need_to_agree_to_the_terms;
    }
    if (Object.keys(errors).length > 0) {
      return errors;
    } else {
      return null;
    }
  };

  const isAuthenticated = () => {
    if (window.innerWidth < 992) {
      dispatch(
        alertActions.alertError(
          trans[locate].this_feature_is_only_operated_on_the_computer
        )
      );
    } else if (!authenticated) {
      dispatch(alertActions.alertError(trans[locate].you_need_to_sign_in));
      return false;
    } else if (!user.hasUploadedKyc || user.kycStatus == "reject") {
      dispatch(
        alertActions.alertError(
          trans[locate].you_need_KYC_erification_to_be_able_to_make_transactions
        )
      );
      return false;
    } else if (user.kycStatus == "pending") {
      dispatch(
        alertActions.alertError(
          trans[locate]
            .we_are_verifying_your_information_please_return_to_trading_in_24h
        )
      );
      return false;
    } else if (status == "unavailable") {
      dispatch(
        alertActions.alertError(trans[locate].you_need_install_metamask)
      );
      return false;
    } else if (status != "connected") {
      dispatch(
        alertActions.alertError(trans[locate].you_need_to_connect_the_wallet)
      );
      return false;
    } else if (!user.walletAddress) {
      dispatch(
        alertActions.alertError(trans[locate].you_need_to_verify_wallet)
      );
      return false;
    } else if (user.walletAddress.toLowerCase() != account.toLowerCase()) {
      dispatch(
        alertActions.addressConnectedNotMatch({
          isConnected: status == "connected",
          myAddress: user.walletAddress,
          connectedAddress: account,
          message:
            trans[locate].the_address_not_match_the_registered_account_address,
        })
      );
      return false;
    } else {
      return true;
    }
  };

  const isApproveStableCoin = async (amount?: number) => {
    try {
      setLoadingAllowance(true);
      let allowance = await web3Contract.stableCoin.methods
        .allowance(user.walletAddress, poolInfo.poolAddress)
        .call();
      allowance = parseInt(allowance);

      let balance = amount ? amount : (mvndAmount + fee);
      setApproved(allowance >= balance);
      return allowance >= balance;
    } catch (e) {
      setApproved(false);
      setLoadingAllowance(false);
      console.log("Error", e);
      return false;
    } finally {
      setLoadingAllowance(false);
    }
  };

  const approve = async () => {
    try {
      setLoadingApprove(true);
      await web3Contract.stableCoin.methods
        .approve(poolInfo.poolAddress, mvndAmount + fee)
        .send({ from: user.walletAddress });
      setApproved(true);
    } catch (err) {
      console.log("🚀 ~ file: submit-sell.tsx:106 ~ approve ~ err:", err);
    } finally {
      setLoadingApprove(false);
    }
  };

  const invest = async () => {
    try {
      setLoadingInvest(true);
      let output = await contractPool.methods
        .invest(assetAmount)
        .send({ from: user.walletAddress });
      console.log("🚀 ~ file: submit-sell.tsx:135 ~ sell ~ value:", output);

      onSuccess({ transactionHash: output?.transactionHash });
    } catch (err) {
      setLoadingInvest(false);
      console.log("🚀 ~ file: submit-sell.tsx:124 ~ sell ~ err:", err);
    } finally {
      setLoadingInvest(false);
    }
  };

  const submit = async () => {
    if (!isAuthenticated()) {
      return;
    }

    setErrors({});
    let errors = validate();
    if (errors) {
      setErrors(errors);
      return;
    } else {
      let _approved = await isApproveStableCoin();
      if (_approved) {
        await invest();
      } else {
        await approve();
      }
    }
  };

  useEffect(() => {
    if (assetAmount && agreePolicy) {
      if (approved) setStepCurrent(1);
      else setStepCurrent(0);
    } else {
      setStepCurrent(-1);
    }
  }, [assetAmount, agreePolicy, approved]);

  return (
    <>
      <ModalBase visible={visible} width={500} onCancel={() => {}}>
        <div className="bg-white w-100 p-3 modal-trade--container">
          <h4 className="text-center">Đầu tư</h4>
          <a
            onClick={() => {
              onCancel();
            }}
            role="button"
            style={{
              fontSize: "1.2rem",
              width: 35,
              height: 35,
              borderRadius: 5,
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 5,
              right: 5,
              border: "1px solid #3333",
            }}
          >
            <i
              style={{ color: "#FEC128" }}
              className="fa-solid fa-xmark-large"
            ></i>
          </a>
          <div className="content">
            <div className="info">
              <Image
                src={assetImage}
                alt="image asset"
                height={75}
                style={{
                  borderRadius: 5,
                  width: 100,
                  aspectRatio: "4/3",
                }}
              />
              <div>
                <h6 className="name">{assetName}</h6>
                <div>
                  <i className="fa-light fa-location-dot me-1"></i>
                  <span style={{ color: "#4D5461" }}>{assetLocation}</span>
                </div>
                <div>
                  <h5 className="text-price">
                    {poolStatus?.unit_price?.toLocaleString("vi-VN")} VND{" "}
                    <span
                      style={{
                        color: "#4d5461",
                        fontWeight: 400,
                        fontSize: 18,
                      }}
                    >
                      /Chứng chỉ
                    </span>
                  </h5>
                </div>
              </div>
            </div>
            <div className="price">
              <div className="desired-price-input mb-0">
                <div className="head">
                  <span>Chứng chỉ</span>
                  <span className="d-flex gap-1" style={{ color: "#9EA3AE" }}>
                    <span>Tối đa:</span>
                    <span style={{ color: "#111" }}>
                      {maxAssetBalance != null ? (
                        `${maxAssetBalance.toLocaleString("vi-VN")} Chứng chỉ`
                      ) : (
                        <Skeleton count={1} style={{ width: 50 }} />
                      )}
                    </span>
                  </span>
                </div>
                <div className="input">
                  <Input
                    size="large"
                    style={{
                      width: "100%",
                      color: "#111",
                    }}
                    addonAfter={<span>{assetSymbol}</span>}
                    disabled={loadingFee || loadingApprove || loadingInvest}
                    value={
                      isNaN(assetAmount)
                        ? ""
                        : assetAmount?.toLocaleString("vi-VN")
                    }
                    onChange={(e) => {
                      setAssetAmount(
                        convertFormattedNumberToNumber(e.target.value)
                      );
                    }}
                    placeholder={trans[locate].minimum_price_is.replace(
                      ":amount",
                      "1"
                    )}
                  />
                  {errors["assetAmount"] && (
                    <span className="input-message-error">
                      {errors["assetAmount"]}
                    </span>
                  )}
                </div>
              </div>
              <div className="my-3 d-flex justify-content-center">
                <Image src="/img/icon-pool-swap.svg" preview={false} />
              </div>
              <div className="desired-price-input">
                <div className="head">
                  <span>Giá</span>
                  <span style={{ color: "#9EA3AE" }}>
                    {trans[locate].balance}:{" "}
                    <span style={{ color: "#111" }}>
                      {balance.toLocaleString("vi-VN")}đ
                    </span>
                  </span>
                </div>
                <div className="input">
                  <Input
                    max={balance}
                    size="large"
                    style={{
                      width: "100%",
                      color: "#111",
                    }}
                    disabled
                    addonAfter={<span>VND</span>}
                    value={
                      isNaN(mvndAmount)
                        ? ""
                        : mvndAmount?.toLocaleString("vi-VN")
                    }
                    // onChange={(e) => {
                    //   setPrice(convertFormattedNumberToNumber(e.target.value));
                    // }}
                    // placeholder={trans[locate].minimum_price_is.replace(
                    //   ":amount",
                    //   "1000đ"
                    // )}
                  />
                  {errors["mvndAmount"] && (
                    <span className="input-message-error">
                      {errors["mvndAmount"]}
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="me-1" style={{ color: "#9EA3AE" }}>
                  {trans[locate].transaction_fee}:{" "}
                </span>
                {loadingFee ? (
                  <Skeleton count={1} style={{ width: 70 }} />
                ) : !mvndAmount ? (
                  <span>0đ</span>
                ) : (
                  <span>
                    {fee.toLocaleString("vi-VN")}đ (
                    {((fee * 100) / mvndAmount).toFixed(2)}
                    %)
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: "#9EA3AE" }}>
                  Số tiền cần thanh toán:{" "}
                </span>
                <span>
                  {!mvndAmount ? 0 : (mvndAmount + fee).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
            </div>
            <div className="confirm">
              <div className="d-flex flex-column">
                <Checkbox
                  checked={agreePolicy}
                  onChange={(e) => setAgreePolicy(e.target.checked)}
                >
                  {
                    trans[locate].i_agree_to_and_abide_by_RETX_policy.split(
                      ":RETX_policy"
                    )[0]
                  }
                  <a href={routeNames.policy(locate)} target={"_blank"}>
                    {trans[locate].RETX_policy}
                  </a>
                  {
                    trans[locate].i_agree_to_and_abide_by_RETX_policy.split(
                      ":RETX_policy"
                    )[1]
                  }
                </Checkbox>
                {errors["agreePolicy"] && (
                  <span className="input-message-error">
                    {errors["agreePolicy"]}
                  </span>
                )}
              </div>
              <div className="d-flex gap-3 mt-2">
                <button
                  onClick={submit}
                  className="btn btn-orange w-50 d-flex justify-content-center gap-3"
                  disabled={approved || !agreePolicy || !mvndAmount}
                >
                  {trans[locate].approved}
                  <CircleSpinner loading={loadingApprove} size={20} />
                </button>
                <button
                  onClick={submit}
                  className="btn btn-orange w-50 d-flex justify-content-center gap-3"
                  disabled={!approved || !agreePolicy || !mvndAmount}
                >
                  {trans[locate].confirm}
                  <CircleSpinner
                    loading={loadingInvest || (loadingApprove && approved)}
                    size={20}
                  />
                </button>
              </div>
              <div
                className="mt-3 mx-auto"
                style={{ width: "calc(100% / 2 + 50px)" }}
              >
                <Steps
                  current={stepCurrent}
                  items={[
                    {
                      title: "",
                    },
                    {
                      title: "",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalBase>
    </>
  );
}
