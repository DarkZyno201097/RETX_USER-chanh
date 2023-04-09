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
import { assetApi, notificationApi } from "@apis/index";
import _ from "lodash";
import { routeNames } from "@utils/router";
import { getListNegotiated } from "@utils/web3";
import { ENotificationTypes } from "src/models/notification.model";

interface IProps {
  assetId: string;
  assetName: string;
  assetAddress: string;
  assetLocation: string;
  numberNFT: number;
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: { transactionHash: string }) => void;
  infoSellCmd: InfoCmd;
  contractCollection: Contract;
  assetImage: string;
}

export default function AcceptSellNFTModal({
  assetId,
  assetName,
  assetAddress,
  assetLocation,
  numberNFT,
  visible,
  onCancel,
  onSuccess,
  infoSellCmd,
  contractCollection,
  assetImage,
}: IProps) {
  const dispatch = useDispatch();
  const { balance, web3Contract, infoContract, web3 } =
    useSelector(contractSelector);
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
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [stepCurrent, setStepCurrent] = useState(-1);

  useEffect(() => {
    (async () => {
      await isApproveStableCoin();
      setAgreePolicy(false);
      setErrors({});
    })();
  }, [numberNFT, visible]);

  useEffect(() => {
    if (web3Contract.nftManagement && web3Contract.stableCoin) {
      const timeOutId = setTimeout(async () => {
        try {
          setLoadingFee(true);
          let _fee = await web3Contract.nftExchange.methods.feeRate().call();
          setFee((parseInt(_fee) * infoSellCmd.price) / 1000);
        } catch (e) {
          setFee(0);
          console.log("Error", e);
        } finally {
          setLoadingFee(false);
        }

        await isApproveStableCoin();
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [web3Contract, infoSellCmd]);

  const validate = () => {
    let errors = {};
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

  const isApproveStableCoin = async () => {
    try {
      setLoadingAllowance(true);
      let allowance = await web3Contract.stableCoin.methods
        .allowance(user.walletAddress, infoContract.nftExchange.address)
        .call();
      allowance = parseInt(allowance);
      setApproved(allowance >= infoSellCmd.price);
      return allowance >= infoSellCmd.price;
    } catch (e) {
      setApproved(false);
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
        .approve(infoContract.nftExchange.address, infoSellCmd.price)
        .send({ from: user.walletAddress });
      setApproved(true);
    } catch (err) {
      console.log("🚀 ~ file: submit-sell.tsx:106 ~ approve ~ err:", err);
    } finally {
      setLoadingApprove(false);
    }
  };

  const sendNotification = async (blockNumber: number, orderLink: string) => {
    let { timestamp } = await web3.eth.getBlock(blockNumber);
    let listNeg = await getListNegotiated({
      nftExchange: web3Contract.nftExchange,
      collectionAddress: assetAddress,
      nftId: numberNFT,
    });

    await notificationApi.sendNotification({
      level: "INFO",
      type: ENotificationTypes.RETX_ASSET_SOLD_SUCCESSFULLY,
      time: parseFloat(timestamp.toString()),
      data: {
        walletAddresses: [user.walletAddress],
        buyerId: user.id,
        nftId: numberNFT.toString(),
        assetId,
        sellPrice: infoSellCmd.price,
        transactionFee: fee,
        revenue: infoSellCmd.price - fee,
        orderLink,
      },
    });

    await notificationApi.sendNotification({
      level: "INFO",
      type: ENotificationTypes.RETX_BID_FAILED,
      time: parseFloat(timestamp.toString()),
      data: {
        walletAddresses: listNeg
          .filter((item) => !!item.is_open && item.maker != user.walletAddress)
          .map((item) => {
            return item.maker;
          }),
        nftId: numberNFT.toString(),
        assetId,
      },
    });
  };

  const accept = async () => {
    try {
      setLoadingAccept(true);

      // Get price range before sell
      let priceRangeOld = await contractCollection.methods
        .getPriceRange()
        .call({ from: account });
      console.log(
        "🚀 ~ file: accept-sell.tsx:191 ~ accept ~ priceRangeOld:",
        priceRangeOld
      );
      let rangeOld = {
        min: parseFloat(priceRangeOld.minPrice),
        max: parseFloat(priceRangeOld.maxPrice),
      };

      let output = await web3Contract.nftExchange.methods
        .sellCmd_accept(assetAddress, numberNFT)
        .send({ from: user.walletAddress });
      console.log("🚀 ~ file: submit-sell.tsx:135 ~ sell ~ output:", output);
      await sendNotification(
        output?.blockNumber,
        `https://testnet.bscscan.com/tx/${output?.transactionHash}`
      );

      // Get price range after sell
      let priceRange = await contractCollection.methods
        .getPriceRange()
        .call({ from: account });
      console.log(
        "🚀 ~ file: accept-sell.tsx:204 ~ accept ~ priceRange:",
        priceRange
      );
      let range = {
        min: parseFloat(priceRange.minPrice),
        max: parseFloat(priceRange.maxPrice),
      };
      await assetApi.cacheDataAsset({
        assetId: "null",
        fieldname: "attributes.priceRange",
        data: range,
        assetAddress,
      });

      let priceFluctuation =
        ((_.mean([range.min, range.max]) -
          _.mean([rangeOld.min, rangeOld.max])) *
          100) /
        _.mean([rangeOld.min, rangeOld.max]);
      console.log(
        "🚀 ~ file: accept-sell.tsx:216 ~ accept ~ priceFluctuation:",
        priceFluctuation
      );
      await assetApi.cacheDataAsset({
        assetId: "null",
        fieldname: "priceFluctuation",
        data: priceFluctuation,
        assetAddress,
      });

      onSuccess({ transactionHash: output?.transactionHash });
    } catch (err) {
      console.log("🚀 ~ file: submit-sell.tsx:124 ~ sell ~ err:", err);
    } finally {
      setLoadingAccept(false);
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
        console.log("On sell");
        await accept();
      } else {
        await approve();
      }
    }
  };

  useEffect(() => {
    if (agreePolicy) {
      if (approved) setStepCurrent(1);
      else setStepCurrent(0);
    } else {
      setStepCurrent(-1);
    }
  }, [agreePolicy, approved]);

  return (
    <>
      <ModalBase visible={visible} width={500} onCancel={() => {}}>
        <div className="bg-white w-100 p-3 modal-trade--container">
          <h4 className="text-center">{trans[locate].buy}</h4>
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
                  <span className="me-1">
                    {trans[locate].product_order_number}:
                  </span>
                  <span style={{ color: "red" }}>{numberNFT}</span>
                </div>
              </div>
            </div>
            <div className="price">
              <div className="desired-price-input">
                <div className="head">
                  <span>{trans[locate].amount_you_have_to_pay}</span>
                  <span style={{ color: "#9EA3AE" }}>
                    {trans[locate].balance}:{" "}
                    <span style={{ color: "#111" }}>
                      {balance.toLocaleString("vi-VN")}đ
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
                    value={infoSellCmd.price?.toLocaleString("vi-VN")}
                    addonAfter={<span>VND</span>}
                    disabled
                  />
                  {errors["price"] && (
                    <span className="input-message-error">
                      {errors["price"]}
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
                ) : (
                  <span>
                    {fee.toLocaleString("vi-VN")}đ (
                    {((fee * 100) / infoSellCmd.price).toFixed(2)}%)
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: "#9EA3AE" }}>
                  {trans[locate].amount_received_by_the_seller}:{" "}
                </span>
                <span>
                  {(infoSellCmd.price - fee).toLocaleString("vi-VN")}đ
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
                  disabled={approved || !agreePolicy}
                >
                  {trans[locate].approved}
                  <CircleSpinner loading={loadingApprove} size={20} />
                </button>
                <button
                  onClick={submit}
                  className="btn btn-orange w-50 d-flex justify-content-center gap-3"
                  disabled={!approved || !agreePolicy}
                >
                  {trans[locate].buy_now}
                  <CircleSpinner loading={loadingAccept} size={20} />
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
