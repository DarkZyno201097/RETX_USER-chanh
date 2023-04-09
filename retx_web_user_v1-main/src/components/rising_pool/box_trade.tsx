import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { Progress, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { PoolInfo, PoolStatus } from "src/models/rising-pool.model";
import { Contract } from "web3-eth-contract";
import InvestRisingPoolModal from "./modal/invest";
import { locateSelector } from "@store/locate/locate.slice";
import SuccessModal from "@components/collection/modal/success";
import { assetApi } from "@apis/index";
import WithdrawRisingPoolModal from "./modal/withdraw";

interface IProps {
  asset: RealEstateAssetView;
}

export default function BoxTradeRisingPool({ asset }: IProps) {
  const { locate, locations } = useSelector(locateSelector);
  const { web3, infoContract, web3Contract } = useSelector(contractSelector);
  const { user } = useSelector(authSelector);
  const [risingPoolContract, setRisingPoolContract] = useState<Contract>(null);
  const [poolStatus, setPoolStatus] = useState<PoolStatus>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo>(null);
  const [investedAmount, setInvestedAmount] = useState<number>(null);
  const [visibleInvestModal, setVisibleInvestModal] = useState(false);
  const [visibleWithdrawModal, setVisibleWithdrawModal] = useState(false);
  const [visibleSuccessModal, setVisibleSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [refreshData, setRefreshData] = useState(0);

  useEffect(() => {
    (async () => {
      if (asset.nftId && web3 && web3Contract.risingPoolManagement) {
        try {
          let pool = new PoolInfo(
            await web3Contract.risingPoolManagement.methods
              .getPoolbyProfileID(asset.nftId)
              .call()
          );
          pool.nftId = asset.nftId;
          setPoolInfo(pool);

          let contract = new web3.eth.Contract(
            JSON.parse(infoContract.risingPool.abi),
            pool.poolAddress
          );
          setRisingPoolContract(contract);

          let _poolStatus = await contract.methods.getPoolStatus().call();
          setPoolStatus(new PoolStatus(_poolStatus));
          await updateCompleteProcess(_poolStatus);

          try {
            let _investedAmount = await contract.methods
              .getInvestedAmount(user.walletAddress)
              .call();
            setInvestedAmount(parseInt(_investedAmount));
          } catch (err) {
            setInvestedAmount(0);
          }
        } catch (err) {
          console.log("🚀 ~ file: box_trade.tsx:32 ~ err:", err);
        }
      }
    })();
  }, [asset, web3, web3Contract, refreshData]);

  const updateCompleteProcess = async (_poolStatus: PoolStatus) => {
    try {
      let completeProcess =
        (_poolStatus.total_funded * 100) / _poolStatus.rising_goal;
      await assetApi.cacheDataAsset({
        assetId: asset._id,
        fieldname: "attributes.completeProcess",
        data: completeProcess,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {/* Modal Success */}
      <SuccessModal
        onCancel={() => {
          setVisibleSuccessModal(false);
          setTransactionHash("");
        }}
        visible={visibleSuccessModal}
        transactionHash={transactionHash}
      />

      {/* Modal Invest */}
      <InvestRisingPoolModal
        assetId={asset._id}
        visible={visibleInvestModal}
        onCancel={() => {
          setVisibleInvestModal(false);
        }}
        assetName={asset.digitalInfo.assetName[locate]}
        assetLocation={locations.getFull(
          asset.additionalInfo.location.cityCode,
          asset.additionalInfo.location.districtCode,
          asset.additionalInfo.location.wardCode
        )}
        assetImage={asset.avatarUrl}
        assetSymbol={asset.digitalInfo.assetSymbol[locate]}
        poolInfo={poolInfo}
        poolStatus={poolStatus}
        contractPool={risingPoolContract}
        onSuccess={async ({ transactionHash }) => {
          setTransactionHash(transactionHash);
          setVisibleInvestModal(false);
          setVisibleSuccessModal(true);
          setRefreshData(refreshData + 1);
        }}
      />

      {/* Modal Withdraw */}
      <WithdrawRisingPoolModal
        assetId={asset._id}
        visible={visibleWithdrawModal}
        onCancel={() => {
          setVisibleWithdrawModal(false);
        }}
        assetName={asset.digitalInfo.assetName[locate]}
        assetLocation={locations.getFull(
          asset.additionalInfo.location.cityCode,
          asset.additionalInfo.location.districtCode,
          asset.additionalInfo.location.wardCode
        )}
        assetImage={asset.avatarUrl}
        assetSymbol={asset.digitalInfo.assetSymbol[locate]}
        poolInfo={poolInfo}
        poolStatus={poolStatus}
        contractPool={risingPoolContract}
        assetContract={web3 && new web3.eth.Contract(JSON.parse(infoContract.asset.abi), asset.digitalInfo.assetAddress)}
        investedAmount={investedAmount}
        onSuccess={async ({ transactionHash }) => {
          setTransactionHash(transactionHash);
          setVisibleWithdrawModal(false);
          setVisibleSuccessModal(true);
          setRefreshData(refreshData + 1);
        }}
      />

      <div className="rising-pool-box-trade mt-3">
        <div className="status-progress">
          <div className="d-flex justify-content-between">
            <h5 className="text-grey-500">
              <b>Đã nhận đầu tư</b>
            </h5>
            <h5 style={{ fontWeight: 700 }}>
              {poolStatus ? (
                poolStatus?.total_funded?.toLocaleString("vi-VN")
              ) : (
                <Skeleton.Button
                  active
                  style={{ height: 20, minWidth: 0, width: 60 }}
                />
              )}{" "}
              VND
            </h5>
          </div>
          <div>
            <Progress
              percent={
                (poolStatus?.total_funded * 100) / poolStatus?.rising_goal
              }
              showInfo={false}
              strokeColor="#FF8800"
            />
            <div className="d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center">
                {poolStatus ? (
                  <span>
                    {(
                      (poolStatus?.total_funded * 100) /
                      poolStatus?.rising_goal
                    )?.toLocaleString("vi-VN")}
                    %
                  </span>
                ) : (
                  <Skeleton.Button
                    active
                    style={{ height: 20, minWidth: 0, width: 30 }}
                  />
                )}
              </span>
              <span>
                {poolInfo != null ? (
                  `${poolInfo.totalInvestor} nhà đầu tư`
                ) : (
                  <Skeleton.Button
                    active
                    style={{ height: 20, minWidth: 0, width: 30 }}
                  />
                )}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div>
              <h6 className="text-grey-500">
                <b>Giá</b>
              </h6>
              <span className="d-flex align-items-end">
                <h3 className="m-0 text-price">
                  {poolStatus ? (
                    `${poolStatus?.unit_price?.toLocaleString("vi-VN")} VND`
                  ) : (
                    <Skeleton.Button
                      active
                      style={{ height: 30, minWidth: 0, width: 90 }}
                    />
                  )}
                </h3>
                <span>/Chứng chỉ</span>
              </span>
            </div>
          </div>
          <div className="mt-3 d-flex gap-3">
            <button
              onClick={() => setVisibleInvestModal(true)}
              className="btn btn-orange"
            >
              Đầu tư ngay
            </button>

            <button
              onClick={() => setVisibleWithdrawModal(true)}
              className="btn btn-orange-light"
            >
              Rút vốn
            </button>
          </div>
          <div className="mt-3">
            <span>
              Bạn đã đầu tư:{" "}
              {investedAmount != null ? (
                <b>{investedAmount} chứng chỉ</b>
              ) : (
                <Skeleton.Button
                  active
                  style={{ height: 20, minWidth: 0, width: 50 }}
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
