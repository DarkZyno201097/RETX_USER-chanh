import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { Tag, Tooltip } from "antd";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { Contract } from "web3-eth-contract";
import Web3 from "web3";

import { divValueBlock, formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";
import { contractSelector } from "@store/contract/contract.slice";
import Networks from "@utils/networks.json";
import { CommentsUser } from "src/models/comment.model";
import { assetApi } from "@apis/index";
import { ImpulseSpinner, StageSpinner } from "react-spinners-kit";
import { parseErrorWeb3 } from "@utils/functions";
import Link from "next/link";
import { PoolInfo, PoolStatus } from "src/models/rising-pool.model";

interface IProps {
  asset: RealEstateAssetView;
  className: string;
  border?: boolean;
}

export default function ProductItem({ asset, className, border }: IProps) {
  const { locate, locations } = useSelector(locateSelector);
  const { infoContract, web3Contract, loadedInfoContracts, web3 } =
    useSelector(contractSelector);

  const [restToken, setRestToken] = useState<string>(null);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    (async () => {
      if (
        web3 &&
        infoContract.collection.abi &&
        asset.digitalInfo.assetAddress &&
        asset.digitalInfo.ownerAddress
      ) {
        // Tính lưu thông
        if (["single_asset"].includes(asset.assetType)) {
          setRestToken(
            asset.ownerBalance != undefined && asset.ownerBalance != null
              ? (
                  (asset.ownerBalance * 100) /
                  asset.digitalInfo.totalSupply
                ).toLocaleString("vi-VN")
              : null
          );
        } else if (asset.assetType == "collection_asset" && totalSupply == 0) {
          let contractCollection = new web3.eth.Contract(
            JSON.parse(infoContract.collection.abi),
            asset.digitalInfo.assetAddress
          );
          let balanceOwner = await contractCollection.methods
            .balanceOf(asset.digitalInfo.ownerAddress)
            .call();
          let totalSupply = asset.digitalInfo.totalSupply;
          balanceOwner = parseInt(balanceOwner);
          setTotalSupply(totalSupply);
          if (totalSupply != 0)
            setRestToken(
              ((balanceOwner * 100) / totalSupply).toLocaleString("vi-VN")
            );
          else setRestToken("100");
        } else if (asset.assetType == 'fund_rising_pool') {
          setRestToken((100-asset.attributes.completeProcess).toString());
        }
      }
    })();
  }, [asset, infoContract, web3, totalSupply]);

  return (
    <a
      role={"button"}
      key={asset?._id}
      className={`a-none ${className}`}
      style={{}}
    >
      <div
        style={{
          position: "relative",
        }}
      >
        {!asset.status && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: "#747474d4",
              position: "absolute",
              width: "100%",
              height: 100,
              zIndex: 10,
              borderRadius: "5px 5px 0px 0px",
            }}
          >
            <h4 className="text-white mb-0 text-stop-trading">
              {asset.assetType == "fund_rising_pool"
                ? trans[locate].pause_calling_for_capital
                : trans[locate].stop_trading}
            </h4>
          </div>
        )}

        {/* Tag symbol */}
        <span className="product-item--tag-symbol">
          {asset.digitalInfo.assetSymbol[locate]}
        </span>
      </div>

      <div
        className="product-item bg-white product-item__active"
        style={{
          ...(border && { border: "1px solid #d1d1d1" }),
        }}
      >
        <Link
          href={routeNames.product + "/" + asset._id}
          className="a-none"
          style={{ position: "relative" }}
        >
          {/* Image */}
          <div className="image h-auto" style={{}}>
            <div style={{ aspectRatio: "4/3" }}>
              {asset?.avatarUrl && (
                <img
                  src={asset.avatarUrl}
                  alt="image"
                  style={{ aspectRatio: "4/3" }}
                />
              )}
              {!asset?.avatarUrl && (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <i
                    className="fa-regular fa-image"
                    style={{
                      color: "#9c9c9c",
                      fontSize: "4rem",
                    }}
                  ></i>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              // border: '1px solid #d1d1d1',
              borderTop: 0,
              borderRadius: "0px 0px 5px 5px",
              display: "flow-root",
            }}
          >
            {/* Sold */}
            <div className="sold">
              <div className="d-flex justify-content-between flex-column flex-xl-row ">
                <span style={{ fontSize: ".8rem" }}>
                  {trans[locate].trading}:{" "}
                  <b>
                    {(100 - parseFloat(restToken)).toLocaleString("vi-VN")}%
                  </b>{" "}
                  {trans[locate].circulate.toLowerCase()}
                </span>
                <span style={{ fontSize: ".8rem" }}>
                  <i className="fa-light fa-comment"></i> {asset.qaCount || 0}
                  <span className="me-2"></span>
                  <i className="fa-light fa-eye"></i> {asset.view}
                </span>
              </div>
              {/* Lưu thông */}
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(100 - parseFloat(restToken)).toFixed(2)}%`,
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <a className="a-none title d-block">
              <Tooltip
                placement="top"
                title={`${asset.digitalInfo.assetName[locate]} (${asset.digitalInfo.assetSymbol[locate]})`}
              >
                <p className="mb-0 text-truncate fs-6">
                  <span style={{ color: "#acacac" }}>#</span>
                  <span style={{ color: "red" }}>{asset.nftId}</span>{" "}
                  {asset.digitalInfo.assetName[locate]}
                </p>
              </Tooltip>
            </a>
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ margin: "0 0.5rem" }}
            >
              <div className="text-truncate ">
                <div className="d-flex gap-1 align-items-center">
                  <i
                    className="fa-solid fa-location-dot"
                    style={{ fontSize: "1rem", color: "#0076ff" }}
                  ></i>
                  <span
                    style={{
                      color: "#5E5E5E",
                    }}
                  >
                    {locations.getCitiesName(
                      asset.additionalInfo.location.cityCode
                    )}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-1 align-items-center">
                <span>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffa100", fontSize: "1.3rem" }}
                  ></i>
                </span>
                <span
                  style={{
                    color: "#5E5E5E",
                    fontSize: "1.2rem",
                  }}
                >
                  {asset.rateMean || 0}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="info mt-1">
              <div className="d-block mt-1 gap-1 gap-xl-1 d-xl-flex flex-column">
                <span className="d-block d-xl-inline">
                  <span className="d-block d-xl-inline">
                    {trans[locate].type}:{" "}
                  </span>
                  <span>
                    <Tag
                      color={
                        ["single_asset", "fund_rising_pool"].includes(
                          asset.assetType
                        )
                          ? "#ff8800"
                          : asset.assetType == "collection_asset"
                          ? "#52c41a"
                          : ""
                      }
                      style={{ width: "fit-content", marginLeft: 5 }}
                    >
                      {["single_asset", "fund_rising_pool"].includes(
                        asset.assetType
                      ) && (
                        <b className="text-capitalize">
                          {trans[locate].certificate_of_investment}
                        </b>
                      )}
                      {asset.assetType == "collection_asset" && (
                        <b className="text-capitalize">
                          {trans[locate].certificate_of_ownership}
                        </b>
                      )}
                    </Tag>
                  </span>
                </span>
              </div>

              <div className="d-block mt-1 gap-1 gap-xl-1 d-xl-flex flex-column">
                <span className="d-block d-xl-inline">
                  <span className="d-block d-xl-inline">
                    {trans[locate].total_supply}:{" "}
                  </span>
                  <span>
                    {["single_asset", "fund_rising_pool"].includes(
                      asset.assetType
                    )
                      ? asset.digitalInfo?.totalSupply.toLocaleString("vi-VN")
                      : totalSupply.toLocaleString("vi-VN")}{" "}
                    {trans[locate].portion}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>
        {/* Price */}
        {asset.assetType == "single_asset" && (
          <PriceSingleAsset asset={asset} />
        )}
        {asset.assetType == "collection_asset" && (
          <PriceCollectionAsset asset={asset} />
        )}
        {asset.assetType == "fund_rising_pool" && (
          <PriceFundRisingPool asset={asset} />
        )}
      </div>
    </a>
  );
}

const PriceSingleAsset = ({ asset }: { asset: RealEstateAssetView }) => {
  const { locate } = useSelector(locateSelector);
  return (
    <>
      {!(asset.price == -1) ? (
        <div className="price text-truncate">
          {asset.price != null ? (
            <div className="d-flex justify-content-between">
              <span>{formatCurrency(asset.price.toString())} VND</span>
              <div>
                {asset?.priceFluctuation > 0 ? (
                  <span style={{ color: "#16c784" }}>
                    <i className="fa-sharp fa-solid fa-arrow-up"></i>{" "}
                    {asset?.priceFluctuation?.toFixed(0)}%
                  </span>
                ) : asset?.priceFluctuation < 0 ? (
                  <span style={{ color: "#ea3943" }}>
                    <i className="fa-sharp fa-solid fa-arrow-down"></i>{" "}
                    {asset?.priceFluctuation?.toFixed(0)}%
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <span style={{ color: "#505050", textTransform: "capitalize" }}>
              {trans[locate].not_open_for_sale_yet}
            </span>
          )}
        </div>
      ) : (
        <div
          onClick={() => {}}
          className="price text-truncate"
          style={{ zIndex: 99 }}
        >
          <a role={"button"}>
            <i className="fa-regular fa-rotate-right"></i>
          </a>
        </div>
      )}
    </>
  );
};

const PriceCollectionAsset = ({ asset }: { asset: RealEstateAssetView }) => {
  const { locate } = useSelector(locateSelector);
  return (
    <>
      <div className="price text-truncate">
        {asset.attributes?.priceRange != null ? (
          <div className="d-flex justify-content-between">
            {asset.attributes?.priceRange.min ==
            asset.attributes?.priceRange.max ? (
              <span>
                {formatCurrency((asset.attributes?.priceRange.min).toString())}{" "}
                VND
              </span>
            ) : (
              <span>
                {formatCurrency((asset.attributes?.priceRange.min).toString())}{" "}
                -{" "}
                {formatCurrency((asset.attributes?.priceRange.max).toString())}{" "}
                VND
              </span>
            )}

            <div>
              {asset?.priceFluctuation > 0 ? (
                <span style={{ color: "#16c784" }}>
                  <i className="fa-sharp fa-solid fa-arrow-up"></i>{" "}
                  {asset?.priceFluctuation?.toFixed(0)}%
                </span>
              ) : asset?.priceFluctuation < 0 ? (
                <span style={{ color: "#ea3943" }}>
                  <i className="fa-sharp fa-solid fa-arrow-down"></i>{" "}
                  {asset?.priceFluctuation?.toFixed(0)}%
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <span style={{ color: "#505050", textTransform: "capitalize" }}>
            Chưa có giao dịch
          </span>
        )}
      </div>
    </>
  );
};

const PriceFundRisingPool = ({ asset }: { asset: RealEstateAssetView }) => {
  const { locate } = useSelector(locateSelector);
  const { web3, infoContract, web3Contract } = useSelector(contractSelector);
  const [isOpenPool, setIsOpenPool] = useState(false);
  const [poolStatus, setPoolStatus] = useState<PoolStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (
        web3 &&
        infoContract.risingPool.abi &&
        web3Contract.risingPoolManagement &&
        asset.nftId
      ) {
        setLoading(true);
        try {
          let pool = new PoolInfo(
            await web3Contract.risingPoolManagement.methods
              .getPoolbyProfileID(asset.nftId)
              .call()
          );
          let poolContract = new web3.eth.Contract(
            JSON.parse(infoContract.risingPool.abi),
            pool.poolAddress
          );
          let { asset_balance, vnd_balance } = await poolContract.methods
            .getPoolBalance()
            .call();
          if (parseFloat(asset_balance) <= 0) {
            setIsOpenPool(false);
          } else {
            setIsOpenPool(true);
          }

          let dataPoolStatus = await poolContract.methods
            .getPoolStatus()
            .call();
          setPoolStatus(new PoolStatus(dataPoolStatus));
        } catch (err) {
          console.log(err);
        }

        setLoading(false);
      }
    })();
  }, [infoContract, web3Contract, asset]);

  return (
    <>
      <div className="price text-truncate">
        {isOpenPool ? (
          <div className="d-flex justify-content-between">
            <span>
              {poolStatus ? (
                `${poolStatus?.unit_price?.toLocaleString("vi-VN")} VND`
              ) : (
                <Skeleton count={1} width={100} />
              )}
            </span>
            <div>
              {asset?.priceFluctuation > 0 ? (
                <span style={{ color: "#16c784" }}>
                  <i className="fa-sharp fa-solid fa-arrow-up"></i>{" "}
                  {asset?.priceFluctuation?.toFixed(0)}%
                </span>
              ) : asset?.priceFluctuation < 0 ? (
                <span style={{ color: "#ea3943" }}>
                  <i className="fa-sharp fa-solid fa-arrow-down"></i>{" "}
                  {asset?.priceFluctuation?.toFixed(0)}%
                </span>
              ) : null}
            </div>
          </div>
        ) : loading ? (
          <Skeleton count={1} width={100} />
        ) : (
          <span style={{ color: "#505050", textTransform: "capitalize" }}>
            {trans[locate].pool_is_not_open_yet}
          </span>
        )}
      </div>
    </>
  );
};
