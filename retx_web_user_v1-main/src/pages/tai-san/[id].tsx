import { assetApi, organizationApi, userApi } from "@apis/index";
import PageLayout from "@layouts/page";
import { convertUrl, parseErrorWeb3, timeToHuman } from "@utils/functions";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { locateSelector } from "@store/locate/locate.slice";
import { divValueBlock } from "@utils/number";
import dynamic from "next/dynamic";
import Image from "next/image";
import { assetSelector } from "@store/asset/asset.slice";
import _ from "lodash";
import {
  Tooltip,
  Pagination,
  Modal,
  Tabs,
  Spin,
  Avatar,
  Button,
  Alert,
  Rate,
} from "antd";
import { CircleSpinner } from "react-spinners-kit";
import moment from "moment";
// dynamic(() => import('moment/locale/vi'));
import "../../resources/vi";
moment.locale("vi");
import { Contract } from "web3-eth-contract";
import { LoadingOutlined } from "@ant-design/icons";

import { formatCurrency } from "@utils/number";
import { alertActions, assetActions } from "@store/actions";
import { authSelector } from "@store/auth/auth.slice";
import { trans } from "src/resources/trans";
import { routeNames } from "@utils/router";
import {
  Comments,
  CommentsQA,
  CommentsUser,
  ICommentsQA,
} from "src/models/comment.model";
import FeedbackItem from "@components/box/feedback_item";
import BoxSwap from "@components/swap/box_swap";
import { contractSelector } from "@store/contract/contract.slice";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { IRoleOrganization, Organization } from "src/models/organization.model";
import ModalBase from "@components/modal";
import TabListHolders from "@components/tab/holders";
import BoxTradeCollection from "@components/collection/box_trade";
import {
  getOwnerOfNftId,
  getP2PTransaction,
  getTransactionsCollectionAsset,
  getTransactionsSingleAsset,
} from "@utils/web3";
import TabTransactionCollectionAsset from "@components/tab/transaction/collection_asset";
import { AssetTransaction } from "src/models/smart_contract.model";
import TabTransactionSingleAsset from "@components/tab/transaction/single_asset";
import { ICart } from "src/models/cart.model";
import BoxTradeRisingPool from "@components/rising_pool/box_trade";
import { getTransactionsRisingPoolAsset } from "@utils/web3/rising_pool";
import TabTransactionRisingPoolAsset from "@components/tab/transaction/rising_pool_asset";

const DynamicSliderProduct = dynamic(
  () => import("@components/slider/slider_product"),
  { ssr: false }
);

const DynamicChartLine = dynamic(() => import("@components/chart/line"), {
  ssr: false,
});

const DynamicSliderProductItem = dynamic(
  () => import("@components/slider/slider_product_item"),
  { ssr: false }
);

interface IHolders {
  address: string;
  amount: number;
  percentage: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { locate, locations } = useSelector(locateSelector);
  moment.locale(locate);
  const { cart } = useSelector(assetSelector);
  const { user, authenticated } = useSelector(authSelector);
  const { id } = router.query;
  const [product, setProduct] = useState(new RealEstateAssetView());
  // const [transactionAll, setTransactionAll] = useState<TransactionDTO[]>([])
  const [total, setTotal] = useState("");
  const [restToken, setRestToken] = useState("");

  const [userHasRatting, setUserHasRatting] = useState(false);

  const [formComment, setFormComment] = useState({
    ratting: 0,
    content: "",
  });

  const [pagCurrent, setPagCurrent] = useState(1);

  const [isConfirm, setIsConfirm] = useState(false);
  const [isClickAddCart, setIsClickAddCart] = useState(false);

  const [ratting, setRatting] = useState(0);
  const [thumbnail, setThumbnail] = useState([]);

  const [commentsQA, setCommentsQA] = useState<ICommentsQA[]>([]);
  const [messageCommentQA, setMessageCommentQA] = useState("");
  const [pageQACurrent, setPageQACurrent] = useState(1);
  const [rattingCount, setRattingCount] = useState({});

  const [holdersAll, setHoldersAll] = useState<IHolders[]>([]);
  const [loadingHolders, setLoadingHolders] = useState(false);
  const [isErrorGetHolders, setIsErrorGetHolders] = useState(false);

  const [assetContract, setAssetContract] = useState<Contract>(null);
  const [unitPrice, setUnitPrice] = useState(0);
  const { infoContract, web3Contract, loadedInfoContracts, web3 } =
    useSelector(contractSelector);
  const [investor, setInvestor] = useState<Organization>(new Organization());
  const [productRecommend, setProductRecommend] = useState<
    RealEstateAssetView[]
  >([]);
  const [rolesOrganization, setRoleOrganization] = useState<
    IRoleOrganization[]
  >([]);
  const colInfoProduct = useRef<HTMLDivElement>();
  const [assetProtection, setAssetProtection] = useState<Organization>(
    new Organization()
  );
  const [commentsRating, setCommentsRating] = useState<CommentsUser[]>([]);
  const [loadingCommentsRating, setLoadingCommentsRating] = useState(false);
  const [loadingProductRecommend, setLoadingProductRecommend] = useState(true);
  const [openModalTab, setOpenModalTab] = useState<
    "releasePolicy" | "recoveryPolicy" | "legal" | ""
  >("");
  const [directions, setDirections] = useState([]);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [tab1Selected, setTab1Selected] = useState("Information");
  const [maxPool, setMaxPool] = useState({
    asset: 0,
    stableCoin: 0,
  });
  const [totalSupply, setTotalSupply] = useState(0);
  const [nftIdSelected, setNftIdSelected] = useState<number>(null);

  useEffect(() => {
    moment.locale(locate);
  }, [locate]);

  const [loadingAsset, setLoadingAsset] = useState(true);

  useEffect(() => {
    if (!!id) {
      (async () => {
        try {
          setLoadingAsset(true);

          let response = await assetApi.getAsset(id as string);
          setProduct(new RealEstateAssetView(response));
          let temp = [];
          temp = [response.avatarUrl, ...response.imagesUrl];
          setThumbnail(temp);

          setLoadingAsset(false);

          try {
            let investorId = response.releasePolicy?.partiesJoin.find(
              (item) => item.roleId == "investor"
            )?.organizationId;
            let investorData = await organizationApi.getOne(investorId);
            setInvestor(investorData);
          } catch (err) {
            console.log("🚀 ~ file: [id].tsx:184 ~ err", err);
          }

          try {
            let protectId = response.releasePolicy?.partiesJoin.find(
              (item) => item.roleId == "securedAssetProtection"
            )?.organizationId;
            let protectData = await organizationApi.getOne(protectId);
            setAssetProtection(protectData);
          } catch (err) {
            console.log("🚀 ~ file: [id].tsx:193 ~ err", err);
          }
        } catch (err) {
          console.log("🚀 ~ file: [id].tsx ~ line 142 ~ err", err);
        }

        try {
          let rolesOrganizationData = await organizationApi.getRoles();
          setRoleOrganization(rolesOrganizationData);
        } catch (err) {
          console.log("🚀 ~ file: [id].tsx:172 ~ err", err);
        }

        try {
          let data = await assetApi.getCommentsBy(id as string);
          setCommentsRating(data);
          handleDataCommentsRating(data);
        } catch (err) {
          console.log("🚀 ~ file: [id].tsx:186 ~ err:", err);
        }

        try {
          let dataCommentsQA: any = await assetApi.commentsQA__list(
            id as string
          );
          setCommentsQA(dataCommentsQA.map((item) => new CommentsQA(item)));
        } catch (err) {
          console.log("🚀 ~ file: [id].tsx:201 ~ err", err);
        }

        try {
          let data: any = await assetApi.getRealEstateInfo();
          setDirections(data.data.directions);
        } catch (err) {
          console.log("🚀 ~ file: [id].tsx:209 ~ err", err);
        }
      })();
    }
  }, [id]);

  // Change data when change language
  useEffect(() => {
    (async () => {
      if (locate && id && firstLoaded) {
        let response = await assetApi.getAsset(id as string);
        setProduct(new RealEstateAssetView(response));
        await getDataTab(tabSelected, response);
        await getDataTab(tab2Selected, response);
      }
    })();
  }, [locate, id]);

  const [loadingBoxSwap, setLoadingBoxSwap] = useState(true);
  const onChangeCirculate = async (balance: number) => {
    await assetApi.cacheDataAsset({
      assetId: product._id,
      fieldname: "ownerBalance",
      data: balance,
    });
  };
  const getCirculation = async () => {
    try {
      if (["single_asset"].includes(product?.assetType)) {
        let owner = product.digitalInfo.ownerAddress;
        let totalSupply = product.digitalInfo.totalSupply;
        let decimals = product.digitalInfo.decimals;

        let balanceOwner = await assetContract.methods.balanceOf(owner).call();
        let restToken = (
          (parseFloat(balanceOwner) * 100) /
          totalSupply
        ).toString();
        let total = divValueBlock(totalSupply.toString(), decimals);
        setRestToken(restToken);
        setTotal(total);
        await onChangeCirculate(parseFloat(balanceOwner));
      } else if (product?.assetType == "collection_asset") {
        let contractCollection = new web3.eth.Contract(
          JSON.parse(infoContract.collection.abi),
          product.digitalInfo.assetAddress
        );
        let balanceOwner = await contractCollection.methods
          .balanceOf(product.digitalInfo.ownerAddress)
          .call();
        let totalSupply = await contractCollection.methods.totalSupply().call();
        balanceOwner = parseInt(balanceOwner);
        totalSupply = parseInt(totalSupply);
        if (totalSupply > 0) {
          setRestToken(
            ((balanceOwner * 100) / totalSupply).toLocaleString("vi-VN")
          );
        } else {
          setRestToken("100");
        }
        setTotalSupply(totalSupply);
      }
    } catch (err) {
      console.log("🚀 ~ file: [id].tsx ~ line 165 ~ err", err);
      setRestToken("100");
      setTotal("0");
      await onChangeCirculate(100);
    } finally {
      // get products recently created
      await getProductRecommend();
      setFirstLoaded(true);
      setLoadingBoxSwap(false);
    }
  };

  const getProductRecommend = async () => {
    try {
      setLoadingProductRecommend(true);
      let { data } = await assetApi.getAssets({
        page: 1,
        limit: 8,
        filterObj: { timeCreated: "asc" },
      });
      setProductRecommend(data);
    } catch (err) {
      setProductRecommend([]);
    } finally {
      setLoadingProductRecommend(false);
    }
  };

  const onFormComment = (fieldname: string) => (value: any) => {
    setFormComment({
      ...formComment,
      [fieldname]: value,
    });
  };

  const resetFormComment = () => {
    setFormComment({
      ratting: 0,
      content: "",
    });
  };

  const submitCommentRating = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!authenticated) {
      dispatch(alertActions.alertError(trans[locate].you_need_to_sign_in));
      return;
    }

    if (!formComment.ratting) {
      dispatch(
        alertActions.alertError(trans[locate].you_need_to_evaluate_stars)
      );
      return;
    }

    try {
      setLoadingCommentsRating(true);
      let res = await assetApi.commentProduct({
        assetId: product._id,
        content: formComment.content,
        ratting: formComment.ratting.toString(),
      });
      setCommentsRating([...commentsRating, res.comment]);
      dispatch(alertActions.alertSuccess(trans[locate].comment_successfully));
      resetFormComment();
      handleDataCommentsRating([...commentsRating, res.comment]);
    } catch (err) {
      console.log(
        "🚀 ~ file: [id].tsx ~ line 227 ~ submitCommentRating ~ err",
        err
      );
    } finally {
      setLoadingCommentsRating(false);
    }
  };

  const [loadingCommentQA, setLoadingCommentQA] = useState(false);
  const commentQA__create = async (
    e: ChangeEvent<HTMLFormElement>,
    parentId?: string,
    content?: string,
    onReplySuccess?: () => void
  ) => {
    e.preventDefault();
    if (!authenticated)
      return dispatch(
        alertActions.alertError(trans[locate].you_need_to_sign_in)
      );
    if (!messageCommentQA)
      if (!content)
        return dispatch(
          alertActions.alertError(trans[locate].you_need_to_fill_in_the_content)
        );

    let data = new CommentsQA();
    data.assetId = id as string;
    data.content = messageCommentQA;
    if (content) data.content = content;
    data.userId = user?.id;
    data.parentId = "";
    if (parentId) data.parentId = parentId;

    try {
      setLoadingCommentQA(true);
      let cmt = await assetApi.commentsQA__create(data);
      let newCmt = new CommentsQA(cmt as any);
      let temp = [...commentsQA];
      if (!newCmt.parentId)
        temp.push({
          ...newCmt,
          parent: [],
          userId: {
            id: user?.id,
            name: user?.name,
            avatarUrl: user?.avatarUrl,
          },
        });
      else {
        for (let i = 0; i < temp.length; i++) {
          if (temp[i]._id == newCmt.parentId) {
            temp[i].parent.push({
              ...newCmt,
              parent: [],
              userId: {
                id: user?.id,
                name: user?.name,
                avatarUrl: user?.avatarUrl,
              },
            });
          }
        }
      }
      setCommentsQA(temp);
      if (!parentId) {
        setMessageCommentQA("");
      }
      if (onReplySuccess) onReplySuccess();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingCommentQA(false);
    }
  };

  const SoldProduct = () => (
    <div className="sold pt-4 mb-2">
      <small
        style={{
          left: 0,
          top: 5,
          fontSize: ".8rem",
          right: "auto",
        }}
      >
        {restToken ? (100 - parseFloat(restToken)).toFixed(2) : ""}%{" "}
        {product.assetType == "single_asset"
          ? trans[locate].circulating
          : trans[locate].sold}
      </small>

      <small
        style={{
          top: 5,
          fontSize: ".8rem",
        }}
      >
        <i className="fa-light fa-comment"></i> {commentsQA.length}
        <span className="me-2"></span>
        <i className="fa-light fa-eye"></i> {product.view}
      </small>
      {restToken ? (
        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${(100 - parseInt(restToken)).toFixed(2)}%`,
              transition: "all .7s",
            }}
          />
        </div>
      ) : (
        <Skeleton count={1} style={{ height: 8 }} />
      )}
    </div>
  );

  const handleDataCommentsRating = (comments: CommentsUser[]) => {
    comments.forEach((item) => {
      if (user?.id)
        if (item.userId?.id == user?.id) {
          setUserHasRatting(true);
        }
    });

    let rattingArray = comments.map((item) => parseInt(item.ratting));
    setRattingCount(_.countBy(rattingArray));
    let mean = parseInt(
      _.meanBy(comments, (o) => parseFloat(o.ratting)).toFixed(0)
    );
    if (isNaN(mean)) mean = 0;
    setRatting(mean);
  };

  const [loadingCart, setLoadingCart] = useState(false);
  const [addedCart, setAddedCart] = useState(false);
  const [dataCart, setDataCart] = useState<ICart>(null);

  useEffect(() => {
    if (product.assetType == "single_asset") {
      let data = cart
        .filter((item) => item.asset.assetType == "single_asset")
        .find((item) => item.asset._id == product._id);
      setAddedCart(!!data?._id);
      setDataCart(data);
    } else if (product.assetType == "collection_asset") {
      let data = cart
        .filter((item) => item.asset.assetType == "collection_asset")
        .find(
          (item) =>
            item.attributes?.nftId == nftIdSelected &&
            item.asset._id == product._id
        );
      setAddedCart(!!data?._id);
      setDataCart(data);
    }
  }, [cart, nftIdSelected]);

  const addCart = async () => {
    setLoadingCart(true);
    try {
      await userApi.cartAdd({
        assetId: product._id,
        attributes:
          product.assetType == "collection_asset"
            ? { nftId: nftIdSelected }
            : {},
      });
      dispatch(alertActions.alertSuccess(trans[locate].add_to_cart_success));
      dispatch(assetActions.loadCart());
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingCart(false);
    }
  };

  const removeProductFromCart = async (id: string) => {
    try {
      setLoadingCart(true);
      await userApi.cartRemove(id);
      dispatch(assetActions.loadCart());
      dispatch(
        alertActions.alertSuccess(trans[locate].removed_from_cart_successfully)
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    if (
      !!web3 &&
      !!product?.digitalInfo?.assetAddress &&
      infoContract.asset.abi &&
      loadedInfoContracts
    ) {
      setAssetContract(
        new web3.eth.Contract(
          JSON.parse(
            ["single_asset", "fund_rising_pool"].includes(product?.assetType)
              ? infoContract.asset.abi
              : product.assetType == "collection_asset"
              ? infoContract.collection.abi
              : "{}"
          ),
          product?.digitalInfo?.assetAddress
        ) as any
      );
    }
  }, [web3, product, infoContract, loadedInfoContracts]);

  const [loadingPrice, setLoadingPrice] = useState(false);

  const onChangePrice = async (price: number) => {
    await assetApi.cacheDataAsset({
      assetId: product._id,
      fieldname: "price",
      data: price,
    });
    product.price = price;
  };

  const onChangePriceFluctuation = async (price: number) => {
    await assetApi.cacheDataAsset({
      assetId: product._id,
      fieldname: "priceFluctuation",
      data: price,
    });
  };

  const calcPriceFluctuation = (price: number, priceOld: number) => {
    return ((price - priceOld) / priceOld) * 100;
  };

  const getUnitPrice = async (assetAddress: string) => {
    try {
      setLoadingPrice(true);
      let input_in = await web3Contract.pancakeRouter.methods
        .getAmountsIn(
          "1",
          [assetAddress, infoContract.stableCoin.address].reverse()
        )
        .call();
      let price = parseFloat(input_in[0]);
      let priceOld = product.price || 0;

      setUnitPrice(price);
      await onChangePrice(price);
      await onChangePriceFluctuation(calcPriceFluctuation(price, priceOld));
    } catch (err) {
      console.log("🚀 ~ file: [id].tsx:514 ~ getUnitPrice ~ err", err);
      let error = parseErrorWeb3(err.message);
      if (
        error?.message == "execution reverted" ||
        err?.message == "Returned error: execution reverted"
      ) {
        setUnitPrice(null);
        onChangePrice(null);
      } else {
        // Oops
        onChangePrice(-1);
      }
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (product?.digitalInfo?.assetAddress && assetContract) {
        if (
          product?.assetType == "single_asset" &&
          !!web3Contract.pancakeRouter
        ) {
          await getPair();
        }
        await getCirculation();
      }
    })();
  }, [web3Contract.pancakeRouter, product, assetContract]);

  // get transactions swap & holders

  const [assetTransactions, setAssetTransactions] = useState<
    AssetTransaction[]
  >([]);
  const [loadingGetAssetTransactions, setLoadingGetAssetTransactions] =
    useState(false);
  const [isErrorGetAssetTransactions, setIsErrorGetAssetTransactions] =
    useState(false);
  const getTransactions = async () => {
    try {
      setLoadingGetAssetTransactions(true);
      setIsErrorGetAssetTransactions(false);

      if (product.assetType == "collection_asset") {
        let transactions = await getTransactionsCollectionAsset({
          web3,
          assetAddress: product.digitalInfo?.assetAddress,
          abiCollection: infoContract.collection.abi,
          abiNftExchange: infoContract.nftExchange.abi,
          assetContract,
        });
        setAssetTransactions([...transactions]);
      } else if (product.assetType == "single_asset") {
        let transactions = await getTransactionsSingleAsset({
          web3,
          assetAddress: product.digitalInfo?.assetAddress,
          abiSingleAsset: infoContract.asset.abi,
          abiPancakeRouter: infoContract.pancakeRouter.abi,
          assetContract,
        });
        setAssetTransactions([...transactions]);
      } else if (product.assetType == "fund_rising_pool") {
        let transactions = await getTransactionsRisingPoolAsset({
          web3,
          assetAddress: product.digitalInfo?.assetAddress,
          abiSingleAsset: infoContract.asset.abi,
          abiPool: infoContract.risingPool.abi,
          assetContract,
        });
        setAssetTransactions([...transactions]);
      }
    } catch (err) {
      console.log(err);
      setIsErrorGetAssetTransactions(true);
    } finally {
      setLoadingGetAssetTransactions(false);
    }
  };

  const getHolders = async () => {
    try {
      setIsErrorGetHolders(false);
      setLoadingHolders(true);
      let holders: IHolders[] = [];

      if (product.assetType == "collection_asset") {
        let ownerAndNftId: { owner: string; nftId: number }[] = [];
        let _totalSupply = product.digitalInfo.totalSupply;
        for (let i = 1; i <= _totalSupply; i++) {
          // let owner: string = await assetContract.methods.ownerOf(i).call()
          let owner = await getOwnerOfNftId({
            assetAddress: product.digitalInfo.assetAddress,
            nftExchangeAddress: infoContract.nftExchange.address,
            assetContract,
            nftExchangeContract: web3Contract.nftExchange,
            nftId: i,
          });
          ownerAndNftId.push({
            owner,
            nftId: i,
          });

          // holders.push({ address: owner.toLowerCase(), amount: balance, percentage: balance * 100 / _totalSupply })
        }
        let ownerAndAmount = Object.values(
          ownerAndNftId.reduce((acc, { owner }) => {
            acc[owner] = acc[owner] || { owner, amount: 0 };
            acc[owner].amount++;
            return acc;
          }, {})
        );
        ownerAndAmount.forEach((item: { owner: string; amount: number }) => {
          holders.push({
            address: item.owner,
            amount: item.amount,
            percentage: (item.amount * 100) / _totalSupply,
          });
        });
      } else if (product.assetType == "single_asset" || product.assetType == "fund_rising_pool") {
        let _assetTransactions = await assetApi.getAssetTransactions(
          product.digitalInfo.assetAddress
        );
        let p2pTransactions = await getP2PTransaction({
          web3,
          abiStableCoin: infoContract.stableCoin.abi,
          stableCoinContract: web3Contract.stableCoin,
          myWalletAddress: product.digitalInfo.assetAddress,
          addressStableCoin: infoContract.stableCoin.address,
        });

        let addressHolders = [
          ..._assetTransactions.flatMap((item) => [item.from, item.to]),
          ...p2pTransactions.flatMap((item) => [item.from, item.to]),
        ];

        let ownerAddress: string = await assetContract.methods
          .getAssetOwner()
          .call();
        addressHolders.push(ownerAddress);

        addressHolders = addressHolders
          .filter((item) => !!item)
          .map((address) => {
            return address.toLowerCase();
          });

        let addressUniq: string[] = _.uniq(addressHolders);
        console.log(
          "🚀 ~ file: [id].tsx:741 ~ getHolders ~ addressUniq:",
          addressUniq
        );

        let total = product.digitalInfo?.totalSupply;

        for (let i = 0; i < addressUniq.length; i++) {
          let balance: string = await assetContract.methods
            .balanceOf(addressUniq[i])
            .call();
          console.log("🚀 ~ file: [id].tsx:772 ~ getHolders ~ balance:", balance)
          if (parseFloat(balance) > 0) {
            holders.push({
              address: addressUniq[i],
              amount: parseFloat(balance),
              percentage: (parseFloat(balance) * 100) / total,
            });
          }
        }
      }

      console.log("holders: ", holders);
      setHoldersAll(holders);
    } catch (err) {
      setIsErrorGetHolders(true);
      console.log("🚀 ~ file: [id].tsx:676 ~ getHolders ~ err:", err);
    } finally {
      setLoadingHolders(false);
    }
  };

  // Get data in tabs
  const [loadingDataTab, setLoadingDataTab] = useState(false);
  const [tabSelected, setTabSelected] = useState<
    "legal" | "releasePolicy" | "recoveryPolicy" | "valuationRecord"
  >("legal");
  const [tab2Selected, setTab2Selected] = useState<
    "releasePolicy" | "recoveryPolicy"
  >("releasePolicy");

  const getDataTab = async (
    tab: "legal" | "releasePolicy" | "recoveryPolicy" | "valuationRecord",
    productTemp?: RealEstateAssetView
  ) => {
    try {
      setLoadingDataTab(true);
      let data = await assetApi.getAsset(router.query.id as string, { tab });
      let temp = { ...(productTemp ? productTemp : product) };
      temp[tab as any] = data;
      setProduct(temp);
    } catch (err) {
      console.log("🚀 ~ file: [id].tsx ~ line 531 ~ getDataTab ~ err", err);
    } finally {
      setLoadingDataTab(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    dispatch(alertActions.alertSuccess(trans[locate].copy_successfully));
  };

  const [pairAddress, setPairAddress] = useState("");
  const getPair = async () => {
    let pairAddress = await web3Contract.pancakeFactory.methods
      .getPair(
        infoContract.stableCoin.address,
        product.digitalInfo.assetAddress
      )
      .call();
    setPairAddress(pairAddress);
  };

  const [loadingPoolSize, setLoadingPoolSize] = useState(false);
  const [loadFailedPoolSize, setLoadFailedPoolSize] = useState(false);
  const onChangePoolSize = async (asset: number, stableCoin: number) => {
    await assetApi.cacheDataAsset({
      assetId: product._id,
      fieldname: "poolSize",
      data: {
        asset,
        stableCoin,
      },
    });
    product.poolSize = {
      asset,
      stableCoin,
    };
  };
  const getPoolSize = async (_pairAddress?: string) => {
    try {
      setLoadingPoolSize(true);
      setLoadFailedPoolSize(false);
      let address = _pairAddress || pairAddress;
      // throw new Error("load failed pool")
      let pairOfStableCoin = await web3Contract.stableCoin.methods
        .balanceOf(address)
        .call();
      let pairOfAsset = await assetContract.methods.balanceOf(address).call();

      setMaxPool({
        asset: pairOfAsset,
        stableCoin: pairOfStableCoin,
      });

      await onChangePoolSize(
        parseFloat(pairOfAsset),
        parseFloat(pairOfStableCoin)
      );
    } catch (error) {
      console.log(error);
      setLoadFailedPoolSize(true);
      await onChangePoolSize(null, null);
    } finally {
      setLoadingPoolSize(false);
    }
  };

  const BoxTrading = () => {
    return (
      <div
        ref={colInfoProduct}
        className="d-flex flex-column justify-content-between"
      >
        {/* Info */}
        <div className="d-none d-xl-block">
          <Tooltip
            placement="top"
            title={`${product.digitalInfo.assetName[locate]} (${product.digitalInfo.assetSymbol[locate]})`}
          >
            <h1
              className="text-uppercase fs-5 line-clamp-2 fw-bold mb-0"
              style={{}}
            >
              <span style={{ color: "#acacac" }}>#</span>
              <span style={{ color: "red" }}>{product.nftId}</span>{" "}
              {product.digitalInfo.assetName[locate]}{" "}
            </h1>
          </Tooltip>
          <h2
            className="mb-2 mt-2"
            style={{ lineHeight: 0, color: "#000000d9" }}
          >
            <span
              className=""
              style={{
                fontSize: 14,
                color: "#000000d9",
              }}
            >
              {product.digitalInfo?.assetAddress?.slice(0, 6)}...
              {product.digitalInfo?.assetAddress?.slice(-6)}
            </span>
            <a
              onClick={() => {
                copy(product.digitalInfo?.assetAddress);
              }}
              className="copy a-none"
              style={{ fontSize: 14 }}
              role="button"
            >
              <i className="fa-regular fa-copy"></i>
            </a>
          </h2>
          {/* Rating */}
          <div className="d-flex gap-1 mb-1 mt-3">
            {[1, 2, 3, 4, 5].map((item) => {
              if (item <= ratting) {
                return (
                  <i
                    key={item}
                    style={{ color: "#ff8800" }}
                    className="fa-solid fa-star me-1"
                  ></i>
                );
              } else
                return (
                  <i
                    key={item}
                    style={{ color: "#99a2aa" }}
                    className="fa-solid fa-star me-1"
                  ></i>
                );
            })}
          </div>

          <div className="mt-2">
            <span
              style={{
                color: "#DA9C00",
                fontSize: 20,
                textTransform: "capitalize",
              }}
            >
              {unitPrice != null ? (
                <>
                  {unitPrice.toLocaleString("vi-VN")} VND/{" "}
                  {trans[locate].portion}
                </>
              ) : (
                trans[locate].not_open_for_sale_yet
              )}
            </span>
          </div>

          {/* Sold */}
          <SoldProduct />
        </div>

        {/* Payment on mobile */}
        {product?.assetType == "single_asset" && (
          <BoxSwap
            product={product}
            onConfirmSuccess={async () => {
              await getUnitPrice(product?.digitalInfo?.assetAddress);
              await getPoolSize(pairAddress);
            }}
            loading={loadingBoxSwap}
            onUpdatePrice={(price) => {
              setUnitPrice(price);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <PageLayout>
      <div
        className="container-fluild container-xl main"
        id="detail-product"
        style={{ position: "relative" }}
      >
        <div className="row">
          <div className="col-12 col-xl-7 pe-xl-4">
            {/* Product detail */}
            <div className="row d-flex">
              {/* Left column */}
              <div className="col-12 col-xl-12">
                <div className="d-flex flex-column h-100 mt-3 m-xl-0">
                  {/* Slider */}
                  <div
                    className="product-detal--slider-image "
                    style={{ marginBottom: 15, position: "relative" }}
                  >
                    {!product.status && !loadingAsset && (
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{
                          backgroundColor: "#787575cc",
                          position: "absolute",
                          width: "100%",
                          height: 100,
                          zIndex: 10,
                        }}
                      >
                        <h3 className="text-white">
                          {trans[locate].stop_trading}
                        </h3>
                      </div>
                    )}
                    <DynamicSliderProduct images={thumbnail} />
                  </div>

                  {/* Info */}
                  <div className="mt-4 d-xl-none">
                    <Tooltip
                      placement="top"
                      title={`${product.digitalInfo.assetName[locate]} (${product.digitalInfo.assetSymbol[locate]})`}
                    >
                      <h1
                        className="text-uppercase fs-5 line-clamp-2 fw-bold mb-2"
                        style={{}}
                      >
                        <span style={{ color: "#acacac" }}>#</span>
                        <span style={{ color: "red" }}>
                          {product.nftId}
                        </span>{" "}
                        {product.digitalInfo.assetName[locate]}{" "}
                      </h1>
                    </Tooltip>
                    <h2
                      className="mb-2 mt-2"
                      style={{ lineHeight: 0, color: "#000000d9" }}
                    >
                      <span
                        className=""
                        style={{
                          fontSize: 14,
                          color: "#000000d9",
                        }}
                      >
                        {product.digitalInfo?.assetAddress?.slice(0, 6)}...
                        {product.digitalInfo?.assetAddress?.slice(-6)}
                      </span>
                      <a
                        onClick={() => {
                          copy(product.digitalInfo?.assetAddress);
                        }}
                        className="copy a-none"
                        style={{ fontSize: 14 }}
                        role="button"
                      >
                        <i className="fa-regular fa-copy"></i>
                      </a>
                    </h2>
                    {/* Rating */}
                    <div className="d-flex gap-1 mt-1 mb-2 mt-xl-3">
                      {[1, 2, 3, 4, 5].map((item) => {
                        if (item <= ratting) {
                          return (
                            <i
                              style={{ color: "#ff8800" }}
                              className="fa-solid fa-star me-1"
                            ></i>
                          );
                        } else
                          return (
                            <i
                              style={{ color: "#99a2aa" }}
                              className="fa-solid fa-star me-1"
                            ></i>
                          );
                      })}
                    </div>

                    <div className="mt-2">
                      <div className="mt-2">
                        <span
                          className="d-flex"
                          style={{
                            color: "#ff8800",
                            fontSize: 20,
                            textTransform: "capitalize",
                          }}
                        >
                          {product.price != null ? (
                            <>
                              {!loadingPrice ? (
                                product.price?.toLocaleString("vi-VN")
                              ) : (
                                <Skeleton style={{ width: 50 }} />
                              )}{" "}
                              VND/ {trans[locate].portion}
                            </>
                          ) : (
                            trans[locate].not_open_for_sale_yet
                          )}
                        </span>
                      </div>

                      <div className="mt-2">
                        <span style={{ color: "#585858" }}>
                          Pool Size:{" "}
                          {loadingPoolSize ? (
                            <Skeleton style={{ width: 50, marginLeft: 5 }} />
                          ) : (
                            <>
                              {product.poolSize?.stableCoin
                                ? formatCurrency(
                                    product.poolSize.stableCoin?.toString()
                                  )
                                : "N/A"}{" "}
                              VND ~{" "}
                              {product.poolSize?.asset
                                ? formatCurrency(
                                    product.poolSize.asset?.toString()
                                  )
                                : "N/A"}{" "}
                              {product.digitalInfo.assetSymbol[locate]}
                            </>
                          )}
                          {loadFailedPoolSize && (
                            <a
                              role={"button"}
                              onClick={() => getPoolSize()}
                              className="ms-2 a-none"
                            >
                              <i className="fa-regular fa-rotate-right"></i>
                            </a>
                          )}
                        </span>
                      </div>
                    </div>
                    {/* Sold */}
                    <SoldProduct />
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-12">
                {/* Pricing */}
                <div className="mt-3">
                  <div className="pricing asset-detail--info">
                    <div className="product-tabs" style={{ maxWidth: 550 }}>
                      <table className="">
                        <tbody>
                          <tr className=" d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                            <td className=" ">
                              <span className=" blur">
                                <i className="fa-light fa-briefcase"></i>
                                {trans[locate].project_owner}
                              </span>
                            </td>
                            <td className=" ms-4 ps-2 ms-lg-0">
                              <span className=" dark">
                                {investor?.name[locate]}
                              </span>
                            </td>
                          </tr>
                          <tr className=" d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                            <td className="">
                              <span className=" blur">
                                <i className="fa-light fa-shapes"></i>
                                {trans[locate].type_project}
                              </span>
                            </td>
                            <td className=" ms-4 ps-2 ms-lg-0">
                              <span className=" dark">
                                {product.legal.form?.name[locate]}
                              </span>
                            </td>
                          </tr>
                          <tr className=" d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                            <td className="">
                              <span className=" blur">
                                <i className="fa-light fa-compass"></i>
                                {trans[locate].issue}
                              </span>
                            </td>
                            <td className=" ms-4 ps-2 ms-lg-0">
                              <span className=" dark">
                                {product.digitalInfo.totalSupply.toLocaleString(
                                  "vi-VN"
                                )}
                                <span style={{ textTransform: "capitalize" }}>
                                  {" "}
                                  {trans[locate].portion}
                                </span>
                              </span>
                            </td>
                          </tr>
                          <tr className=" d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                            <td className="">
                              <span className=" blur">
                                <i className="fa-light fa-square"></i>
                                {trans[locate].purpose}
                              </span>
                            </td>
                            <td className=" ms-4 ps-2 ms-lg-0">
                              <span className=" dark">
                                {product.additionalInfo.purpose ||
                                  trans[locate].updating}
                              </span>
                            </td>
                          </tr>
                          <tr className=" d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                            <td className="">
                              <span className=" blur">
                                <i className="fa-light fa-location-dot" />
                                {trans[locate].location}
                              </span>
                            </td>
                            <td className=" ms-4 ps-2 ms-lg-0">
                              <span className=" dark">
                                {locations.getFull(
                                  product.additionalInfo?.location?.cityCode,
                                  product.additionalInfo?.location
                                    ?.districtCode,
                                  product.additionalInfo?.location?.wardCode
                                )}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Button add cart */}
                    <div>
                      {(product.assetType == "collection_asset" &&
                        !!nftIdSelected) ||
                      product.assetType == "single_asset" ? (
                        <div className="d-flex mb-2 align-items-center">
                          <Modal
                            title={trans[locate].notification}
                            visible={isClickAddCart}
                            footer={null}
                            onCancel={() => setIsClickAddCart(false)}
                          >
                            <div>
                              <p>Chức năng này đang được phát triển</p>
                            </div>
                          </Modal>
                          {!addedCart ? (
                            <button
                              onClick={() => {
                                if (!loadingCart) {
                                  if (authenticated) addCart();
                                  else
                                    dispatch(
                                      alertActions.alertError(
                                        trans[locate].you_need_to_sign_in
                                      )
                                    );
                                }
                              }}
                              disabled={loadingCart}
                              className="add-to-cart d-flex justify-content-center gap-2 align-items-center"
                              style={{ padding: "7px 15px" }}
                            >
                              <span>{trans[locate].add_to_cart}</span>
                              <CircleSpinner
                                color="#e9a806"
                                size={15}
                                loading={loadingCart}
                              />
                            </button>
                          ) : (
                            <button
                              className="add-to-cart px-4 py-1"
                              onClick={() => {
                                removeProductFromCart(dataCart?._id);
                              }}
                            >
                              {trans[locate].remove_from_cart}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}

            <div
              className="border p-4 pt-2 pb-3 mt-3 product-tabs"
              style={{
                borderRadius: 5,
                backgroundColor: "#ebebeb4d",
              }}
            >
              <Tabs
                defaultActiveKey="1"
                tabBarExtraContent={{
                  right: tab1Selected != "Information" && (
                    <div style={{ marginBottom: 10 }}>
                      {loadingGetAssetTransactions || loadingHolders ? (
                        <Spin
                          indicator={
                            <LoadingOutlined
                              style={{ fontSize: 24, color: "#fec128" }}
                              spin
                            />
                          }
                        />
                      ) : null}
                      {!loadingGetAssetTransactions &&
                        ["Transaction", "Chart"].includes(tab1Selected) && (
                          <Button onClick={getTransactions}>
                            <span className="fs-6">
                              <i className="fa-regular fa-rotate-right"></i>
                            </span>
                          </Button>
                        )}
                      {!loadingHolders &&
                        ["Investors"].includes(tab1Selected) && (
                          <Button onClick={getHolders}>
                            <span className="fs-6">
                              <i className="fa-regular fa-rotate-right"></i>
                            </span>
                          </Button>
                        )}
                    </div>
                  ),
                }}
                onChange={async (value) => {
                  setTab1Selected(value);
                  if (value == "Transaction" || value == "Chart") {
                    if (assetTransactions.length == 0) {
                      await getTransactions();
                    }
                  } else if (value == "Investors") {
                    if (holdersAll.length == 0) {
                      await getHolders();
                    }
                  }
                }}
              >
                <Tabs.TabPane
                  tab={trans[locate].project_information}
                  key="Information"
                >
                  <div
                    style={{
                      height: 400,
                      overflowY: "auto",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: product?.information[locate] || "",
                    }}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab={trans[locate].chart} key="Chart">
                  <div
                    style={{
                      height: 400,
                      overflowY: "auto",
                    }}
                  >
                    {isErrorGetAssetTransactions &&
                    !loadingGetAssetTransactions ? (
                      <Alert
                        // message="Error"
                        description={
                          trans[locate].you_have_request_more_than_allowed
                        }
                        type="error"
                        showIcon
                      />
                    ) : (
                      <>
                        {assetTransactions.length != 0 &&
                          product.assetType == "collection_asset" && (
                            <DynamicChartLine
                              xLabels={[...assetTransactions]
                                .filter((item) => item.nftId == nftIdSelected)
                                .filter((item) => item.method != "transferFrom")
                                .sort((a, b) => a.blockNumber - b.blockNumber)
                                .map((item) => {
                                  return moment(item.timestamp * 1000).format(
                                    "DD/MM/YYYY, HH:mm"
                                  );
                                })}
                              series={[
                                {
                                  name: "Giá",
                                  data: [...assetTransactions]
                                    .filter(
                                      (item) => item.nftId == nftIdSelected
                                    )
                                    .filter(
                                      (item) => item.method != "transferFrom"
                                    )
                                    .sort(
                                      (a, b) => a.blockNumber - b.blockNumber
                                    )
                                    .map((item) => {
                                      return item.price;
                                    }),
                                },
                              ]}
                            />
                          )}

                        {assetTransactions.length != 0 &&
                          ["single_asset", "fund_rising_pool"].includes(product.assetType) && (
                            <DynamicChartLine
                              xLabels={[...assetTransactions]
                                .filter((item) => item.method != "transfer")
                                .sort((a, b) => a.blockNumber - b.blockNumber)
                                .map((item) => {
                                  return moment(item.timestamp * 1000).format(
                                    "DD/MM/YYYY, HH:mm"
                                  );
                                })}
                              series={[
                                {
                                  name: "Giá",
                                  data: [...assetTransactions]
                                    .filter((item) => item.method != "transfer")
                                    .sort(
                                      (a, b) => a.blockNumber - b.blockNumber
                                    )
                                    .map((item) => {
                                      return item.price / item.amount;
                                    }),
                                },
                              ]}
                            />
                          )}
                      </>
                    )}
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab={trans[locate].investors} key="Investors">
                  <div>
                    {isErrorGetHolders && !loadingHolders ? (
                      <Alert
                        // message="Error"
                        description={
                          trans[locate].you_have_request_more_than_allowed
                        }
                        type="error"
                        showIcon
                      />
                    ) : (
                      <>
                        <TabListHolders
                          data={holdersAll}
                          loading={loadingHolders}
                        />
                      </>
                    )}
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab={trans[locate].transaction} key="Transaction">
                  <div>
                    {product.assetType == "collection_asset" && (
                      <TabTransactionCollectionAsset
                        transactions={assetTransactions}
                        loading={loadingGetAssetTransactions}
                      />
                    )}

                    {product.assetType == "single_asset" && (
                      <TabTransactionSingleAsset
                        transactions={assetTransactions}
                        loading={loadingGetAssetTransactions}
                      />
                    )}

                    {product.assetType == "fund_rising_pool" && (
                      <TabTransactionRisingPoolAsset
                        transactions={assetTransactions}
                        loading={loadingGetAssetTransactions}
                      />
                    )}
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>

            <ModalBase
              visible={!!openModalTab}
              onCancel={() => {
                setOpenModalTab("");
              }}
            >
              <div
                className="bg-white p-3 d-flex"
                style={{
                  // minWidth: 500,
                  borderRadius: 5,
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: product[openModalTab]?.content[locate],
                  }}
                />
              </div>
            </ModalBase>

            <section className="mt-4">
              <h6
                style={{
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                {trans[locate].policy_and_legal_status_of_und_unit}
              </h6>
              <div
                className="border p-4 pt-2 pb-3 mt-1 product-tabs"
                style={{
                  borderRadius: 5,
                  backgroundColor: "#ebebeb4d",
                }}
              >
                <Tabs
                  defaultActiveKey="1"
                  onChange={async (value) => {
                    setTab2Selected(value as any);
                    await getDataTab(value as any);
                  }}
                  tabBarExtraContent={{
                    right: (
                      <>
                        {loadingDataTab && (
                          <Spin
                            indicator={
                              <LoadingOutlined
                                style={{ fontSize: 24, color: "#fec128" }}
                                spin
                              />
                            }
                          />
                        )}
                      </>
                    ),
                  }}
                >
                  <Tabs.TabPane
                    tab={trans[locate].releasePolicy}
                    key="releasePolicy"
                  >
                    <table>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="">
                          <span className="blur">
                            <i className="fa-solid fa-briefcase"></i>
                            {trans[locate].notarization_unit}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <span className="dark">
                            {
                              product.releasePolicy?.notarizationUnit?.name[
                                locate
                              ]
                            }
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td>
                          <span className="blur">
                            <i className="fa-regular fa-calendar-days"></i>
                            {trans[locate].notarization_date}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <span className="dark">
                            {moment(
                              product.releasePolicy?.notarizationDate
                            ).format("DD/MM/YYYY")}
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="d-flex">
                          <span className="blur">
                            <i className="fa-regular fa-users"></i>
                            {trans[locate].parties_join_in_notarization}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <ul
                            className="m-0 p-0 d-flex flex-column gap-3"
                            style={{ listStyle: "none" }}
                          >
                            {product.releasePolicy?.partiesJoin?.map(
                              (item, index) => {
                                return (
                                  <li
                                    key={`${item.role}_${index}`}
                                    className="d-flex flex-column"
                                  >
                                    <ItemParties
                                      {...item}
                                      rolesOrganization={rolesOrganization}
                                    />
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-3">
                        <a
                          style={{
                            backgroundColor: "#e1e1e1",
                            borderColor: "#e1e1e1",
                            color: "#111",
                          }}
                          role="button"
                          className="product-tabs-button--scan gap-2"
                          onClick={() => {
                            setOpenModalTab("releasePolicy");
                          }}
                        >
                          <span>{trans[locate].main_content}</span>
                          <span>
                            <i className="fa-regular fa-chevron-down"></i>
                          </span>
                        </a>
                      </div>
                      <div className="d-flex gap-3">
                        <a
                          href={convertUrl(product.releasePolicy?.docUri)}
                          target={"_blank"}
                          className="product-tabs-button--scan gap-2"
                        >
                          <span>{trans[locate].view_file_scan}</span>
                        </a>
                      </div>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={trans[locate].recoveryPolicy}
                    key="recoveryPolicy"
                  >
                    <table>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="">
                          <span className="blur">
                            <i className="fa-solid fa-briefcase"></i>
                            {trans[locate].notarization_unit}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <span className="dark">
                            {
                              product.recoveryPolicy?.notarizationUnit?.name[
                                locate
                              ]
                            }
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td>
                          <span className="blur">
                            <i className="fa-regular fa-calendar-days"></i>
                            {trans[locate].notarization_date}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <span className="dark">
                            {moment(
                              product.recoveryPolicy?.notarizationDate
                            ).format("DD/MM/YYYY")}
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="d-flex">
                          <span className="blur">
                            <i className="fa-regular fa-users"></i>
                            {trans[locate].parties_join_in_notarization}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0">
                          <ul
                            className="m-0 p-0 d-flex flex-column gap-3"
                            style={{ listStyle: "none" }}
                          >
                            {product.recoveryPolicy?.partiesJoin?.map(
                              (item, index) => {
                                return (
                                  <li
                                    key={`${item.role}_${index}`}
                                    className="d-flex flex-column"
                                  >
                                    <ItemParties
                                      {...item}
                                      rolesOrganization={rolesOrganization}
                                    />
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-3">
                        <a
                          style={{
                            backgroundColor: "#e1e1e1",
                            borderColor: "#e1e1e1",
                            color: "#111",
                          }}
                          role="button"
                          className="product-tabs-button--scan gap-2"
                          onClick={() => {
                            setOpenModalTab("recoveryPolicy");
                          }}
                        >
                          <span>{trans[locate].main_content}</span>
                          <span>
                            <i className="fa-regular fa-chevron-down"></i>
                          </span>
                        </a>
                      </div>
                      <div className="d-flex gap-3">
                        <a
                          href={convertUrl(product.recoveryPolicy?.docUri)}
                          target={"_blank"}
                          className="product-tabs-button--scan gap-2"
                        >
                          <span>{trans[locate].view_file_scan}</span>
                        </a>
                      </div>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </section>

            <section className="mt-4">
              <h6
                style={{
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                {trans[locate].information_and_legality_of_the_collateral}
              </h6>
              <div
                className="border p-4 pt-2 pb-3 mt-1 product-tabs"
                style={{
                  borderRadius: 5,
                  backgroundColor: "#ebebeb4d",
                }}
              >
                <Tabs
                  defaultActiveKey="1"
                  onChange={async (value) => {
                    setTabSelected(value as any);
                    await getDataTab(value as any);
                  }}
                  tabBarExtraContent={{
                    right: (
                      <>
                        {loadingDataTab && (
                          <Spin
                            indicator={
                              <LoadingOutlined
                                style={{ fontSize: 24, color: "#fec128" }}
                                spin
                              />
                            }
                          />
                        )}
                      </>
                    ),
                  }}
                >
                  <Tabs.TabPane
                    tab={trans[locate].valuation}
                    key="valuationRecord"
                  >
                    <div className="tab-valuation">
                      <table>
                        <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                          <td className="">
                            <span className="blur">
                              <i className="fa-solid fa-coins"></i>
                              {trans[locate].valuation_level}
                            </span>
                          </td>
                          <td className="ms-3 ms-lg-0">
                            <span className="dark">
                              {product.valuationRecord?.valuation?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </span>
                          </td>
                        </tr>
                        <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                          <td>
                            <span className="blur">
                              <i className="fa-regular fa-calendar-days"></i>
                              {trans[locate].effect}
                            </span>
                          </td>
                          <td className="ms-3 ms-lg-0">
                            <span className="dark">
                              {product.valuationRecord.valuationDate &&
                                moment(
                                  product.valuationRecord.valuationDate
                                ).format("DD/MM/YYYY")}
                            </span>
                          </td>
                        </tr>
                        <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                          <td>
                            <span className="blur">
                              <i className="fa-solid fa-landmark"></i>
                              {trans[locate].inspection_unit}
                            </span>
                          </td>
                          <td className="ms-3 ms-lg-0">
                            <span className="dark">
                              {
                                product.valuationRecord?.valuationUnit?.name[
                                  locate
                                ]
                              }
                            </span>
                            <a
                              href={
                                product.valuationRecord?.valuationUnit?.website
                              }
                              target={"_blank"}
                              role={"button"}
                              className="ms-1"
                            >
                              <span className="icon-info">
                                <i className="fa-duotone fa-circle-info"></i>
                              </span>
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div className="d-flex justify-content-end align-items-center">
                        <div className="d-flex gap-3">
                          <a
                            href={convertUrl(product.valuationRecord?.docUri)}
                            target={"_blank"}
                            role="button"
                            className="product-tabs-button--scan gap-2"
                          >
                            <span>{trans[locate].view_file_scan}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={trans[locate].legalOfProperty} key="legal">
                    <table>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="">
                          <span className="blur">
                            <i className="fa-solid fa-briefcase"></i>
                            {trans[locate].inspection_unit}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0t">
                          <span className="dark">
                            {product.legal?.inspectionUnit?.name[locate]}
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td>
                          <span className="blur">
                            <i className="fa-regular fa-calendar-days"></i>
                            {trans[locate].inspection_date}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0t">
                          <span className="dark">
                            {moment(product.legal?.inspectionDate).format(
                              "DD/MM/YYYY"
                            )}
                          </span>
                        </td>
                      </tr>
                      <tr className="d-flex flex-column d-md-table-row mb-3 mb-lg-0">
                        <td className="d-flex">
                          <span className="blur">
                            <i className="fa-sharp fa-solid fa-award"></i>
                            {trans[locate].status}
                          </span>
                        </td>
                        <td className="ms-3 ms-lg-0t">
                          <ul
                            className="m-0 p-0 d-flex flex-column gap-3"
                            style={{ listStyle: "none" }}
                          >
                            <li className="d-flex flex-column">
                              <span className="blur">
                                {trans[locate].red_book}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                <span className="dark">
                                  {product?.legal?.isRedBook
                                    ? trans[locate].have_red_book
                                    : trans[locate].have_not_red_book}
                                </span>
                              </div>
                            </li>
                            <li className="d-flex flex-column">
                              <span className="blur">
                                {trans[locate].dispute}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                <span className="dark">
                                  {product.legal?.isDispute
                                    ? trans[locate].have_dispute
                                    : trans[locate].have_not_dispute}
                                </span>
                              </div>
                            </li>
                            <li className="d-flex flex-column">
                              <span className="blur">
                                {trans[locate].type_of_asset}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                <span className="dark">
                                  {product.legal?.form?.name[locate]}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-3">
                        <a
                          style={{
                            backgroundColor: "#e1e1e1",
                            borderColor: "#e1e1e1",
                            color: "#111",
                          }}
                          role="button"
                          className="product-tabs-button--scan gap-2"
                          onClick={() => {
                            setOpenModalTab("legal");
                          }}
                        >
                          <span>{trans[locate].main_content}</span>
                          <span>
                            <i className="fa-regular fa-chevron-down"></i>
                          </span>
                        </a>
                      </div>
                      <div className="d-flex gap-3">
                        <a
                          href={convertUrl(product.legal?.docUri)}
                          target={"_blank"}
                          className="product-tabs-button--scan gap-2"
                        >
                          <span>{trans[locate].view_file_scan}</span>
                        </a>
                      </div>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={trans[locate].lock} key="lock">
                    <div className="box-protect-award py-2 px-3">
                      <span className="me-1">
                        <i className="fa-solid fa-award"></i>
                      </span>
                      <span>
                        {trans[locate].product_is_being_protected_by}:{" "}
                        <b>{assetProtection.name[locate]}</b>
                      </span>
                    </div>
                    <p className="mt-2">
                      {assetProtection.name[locate]}{" "}
                      {trans[locate].is_responsible_for}:
                      {/* <br />
                                            - {trans[locate].lock_content_1}
                                            <br />
                                            - {trans[locate].lock_content_2}
                                            <br />
                                            - {trans[locate].lock_content_3} */}
                      <ul
                        style={{
                          listStyle: "none",
                          paddingLeft: 20,
                        }}
                      >
                        <li className="list-dash-before">
                          {trans[locate].lock_content_1}
                        </li>
                        <li className="list-dash-before">
                          {trans[locate].lock_content_2}
                        </li>
                        <li className="list-dash-before">
                          {trans[locate].lock_content_3}
                        </li>
                      </ul>
                    </p>
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </section>

            <style jsx global>
              {`
                .ant-tabs-ink-bar {
                  background: #ffc127;
                }

                .ant-tabs-top > .ant-tabs-nav .ant-tabs-ink-bar,
                .ant-tabs-bottom > .ant-tabs-nav .ant-tabs-ink-bar,
                .ant-tabs-top > div > .ant-tabs-nav .ant-tabs-ink-bar,
                .ant-tabs-bottom > div > .ant-tabs-nav .ant-tabs-ink-bar {
                  height: 3px;
                }

                .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                  color: #000929;
                }

                .ant-tabs-tab-btn {
                  color: #394150;
                  font-weight: 600;
                  font-size: 1rem;
                }

                .ant-tabs-top > .ant-tabs-nav::before,
                .ant-tabs-bottom > .ant-tabs-nav::before,
                .ant-tabs-top > div > .ant-tabs-nav::before,
                .ant-tabs-bottom > div > .ant-tabs-nav::before {
                  border-bottom: 1px solid #dee2e6;
                }
              `}
            </style>

            <section className="mt-4">
              <h6
                style={{
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                {trans[locate].project_procedures}
              </h6>
              <div className="box-legal-record p-2 mt-1">
                <div className="title d-flex gap-2">
                  <span>
                    <i className="fa-regular fa-file"></i>
                  </span>
                  <span>{trans[locate].project_procedures_title_box}:</span>
                </div>
                <div
                  className="mt-2 fs-6 d-flex gap-2"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#505050",
                    wordBreak: "break-all",
                  }}
                >
                  <span>{product.digitalInfo?.nftAddress}</span>
                  <a
                    onClick={() => {
                      copy(product.digitalInfo?.nftAddress);
                    }}
                    role={"button"}
                  >
                    <i className="fa-regular fa-copy"></i>
                  </a>
                </div>
                <h6
                  style={{
                    fontWeight: 600,
                    color: "#acacac",
                  }}
                >
                  NFT ID: <span style={{ color: "red" }}>{product.nftId}</span>
                </h6>
                <a
                  href={convertUrl(product.digitalInfo.nftUri)}
                  target={"_blank"}
                  style={{
                    fontStyle: "italic",
                    fontSize: "0.85rem",
                    textDecoration: "underline",
                  }}
                >
                  {trans[locate].view_public_records_at_IPFS}
                </a>
              </div>
            </section>

            <div className="d-block d-xl-none">
              <BoxTrading />

              {product?.assetType == "collection_asset" && (
                <div className="mt-4">
                  <BoxTradeCollection
                    asset={product}
                    onChangeNftIdSelected={setNftIdSelected}
                  />
                </div>
              )}
            </div>

            <div
              className="mt-4"
              dangerouslySetInnerHTML={{
                __html: product.additionalInfo?.location?.embedLink?.replace(
                  'width="600"',
                  'width="100%"'
                ),
              }}
            />

            {/* Profile */}
            <div className="profile mt-4 d-flex gap-4 p-2">
              <div className="flex-shrink-1 d-flex justify-content-center">
                <div
                  className="avatar"
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  <img
                    src={investor?.imageUrl || "/img/logo-diamond-gold.png"}
                  />
                </div>
              </div>
              <div className="d-flex flex-column justify-content-between  py-2 info">
                <div>
                  <h5 className="mb-1">{investor?.name[locate]}</h5>
                  <a
                    href={investor?.website}
                    className="d-flex gap-2 align-items-center"
                  >
                    <i
                      style={{ color: "#5e5e5e" }}
                      className="fa-light fa-globe"
                    ></i>
                    {investor?.website}
                  </a>
                </div>
                <div>
                  <a
                    href={routeNames.product + `?seller=${investor?._id}`}
                    type="button"
                    className="btn-profile py-1 px-4 mt-2"
                    style={{ textTransform: "capitalize" }}
                  >
                    {trans[locate].see_more_product}
                  </a>
                </div>
              </div>
            </div>

            <div className="list-comment summary-ratting mt-3">
              <h5 className="title">
                {" "}
                {trans[locate].ratting_and_comment}{" "}
                <span className="title-badge">{commentsRating.length}</span>{" "}
              </h5>
              <div className="row">
                <div className="col-lg-3">
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <h6
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#595959" }}
                    >
                      {" "}
                      {trans[locate].average_rating}{" "}
                    </h6>
                    <div className="ratting-number">{ratting}/5</div>
                    <div className="ratting-start">
                      {[1, 2, 3, 4, 5].map((item) => {
                        if (item <= ratting)
                          return (
                            <i
                              style={{ color: "#ff8800" }}
                              className="fa-solid fa-star me-1"
                            ></i>
                          );
                        else
                          return (
                            <i
                              style={{ color: "#99a2aa" }}
                              className="fa-solid fa-star me-1"
                            ></i>
                          );
                      })}
                    </div>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="d-flex align-items-center h-100 justify-content-center">
                    <div>
                      <div className="ratting-bar d-flex align-items-center">
                        <span className="fs-6">5</span>
                        <i
                          style={{ color: "#ff8800" }}
                          className="fa-solid fa-star mx-1"
                        ></i>
                        <div style={{ height: 10 }} className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                (rattingCount["5"] * 100) /
                                  commentsRating.length || 0
                              }%`,
                              backgroundColor: "#ff8800",
                            }}
                          ></div>
                        </div>
                        <span
                          className="fs-6 ms-1"
                          style={{ color: "#838383" }}
                        >
                          {rattingCount["5"] || 0}
                        </span>
                      </div>
                      <div className="ratting-bar d-flex align-items-center">
                        <span className="fs-6">4</span>
                        <i
                          style={{ color: "#ff8800" }}
                          className="fa-solid fa-star mx-1"
                        ></i>
                        <div style={{ height: 10 }} className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                (rattingCount["4"] * 100) /
                                  commentsRating.length || 0
                              }%`,
                              backgroundColor: "#ff8800",
                            }}
                          ></div>
                        </div>
                        <span
                          className="fs-6 ms-1"
                          style={{ color: "#838383" }}
                        >
                          {rattingCount["4"] || 0}
                        </span>
                      </div>
                      <div className="ratting-bar d-flex align-items-center">
                        <span className="fs-6">3</span>
                        <i
                          style={{ color: "#ff8800" }}
                          className="fa-solid fa-star mx-1"
                        ></i>
                        <div style={{ height: 10 }} className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                (rattingCount["3"] * 100) /
                                  commentsRating.length || 0
                              }%`,
                              backgroundColor: "#ff8800",
                            }}
                          ></div>
                        </div>
                        <span
                          className="fs-6 ms-1"
                          style={{ color: "#838383" }}
                        >
                          {rattingCount["3"] || 0}
                        </span>
                      </div>
                      <div className="ratting-bar d-flex align-items-center">
                        <span className="fs-6">2</span>
                        <i
                          style={{ color: "#ff8800" }}
                          className="fa-solid fa-star mx-1"
                        ></i>
                        <div style={{ height: 10 }} className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                (rattingCount["2"] * 100) /
                                  commentsRating.length || 0
                              }%`,
                              backgroundColor: "#ff8800",
                            }}
                          ></div>
                        </div>
                        <span
                          className="fs-6 ms-1"
                          style={{ color: "#838383" }}
                        >
                          {rattingCount["2"] || 0}
                        </span>
                      </div>
                      <div className="ratting-bar d-flex align-items-center">
                        <span className="fs-6">1</span>
                        <i
                          style={{ color: "#ff8800" }}
                          className="fa-solid fa-star mx-1"
                        ></i>
                        <div style={{ height: 10 }} className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                ((rattingCount["1"] || 0) * 100) /
                                commentsRating.length
                              }%`,
                              backgroundColor: "#ff8800",
                            }}
                          ></div>
                        </div>
                        <span
                          className="fs-6 ms-1"
                          style={{ color: "#838383" }}
                        >
                          {rattingCount["1"] || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List comment */}
            <div className="list-comment list-feedback mt-4">
              <h5 className="heading d-flex">
                {trans[locate].feedback_for_this_product}
              </h5>
              <div className="list-comment--content">
                {authenticated &&
                  user?.kycStatus == "verified" &&
                  !userHasRatting && (
                    <>
                      <Rate
                        style={{ fontSize: 40, color: "#ff8800" }}
                        onChange={(value) => onFormComment("ratting")(value)}
                      />
                      <form
                        onSubmit={submitCommentRating}
                        style={{ position: "relative" }}
                      >
                        <div className="mt-3"></div>
                        <textarea
                          onChange={(e) =>
                            onFormComment("content")(e.target.value)
                          }
                          value={formComment.content}
                          name="input-content"
                          placeholder={trans[locate].write_comment}
                          className="input-content"
                          style={{ width: "100%" }}
                          rows={2}
                        ></textarea>
                        <button
                          type="submit"
                          className="btn-primary-light btn-submit"
                        >
                          {trans[locate].submit_ratting}
                        </button>

                        {loadingCommentsRating ? (
                          <div
                            style={{ width: 113 }}
                            className="btn-primary-light btn-submit d-flex justify-content-center align-content-center"
                          >
                            <CircleSpinner color="#fff" size={20} />
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="btn-primary-light btn-submit"
                            style={{ fontWeight: "normal" }}
                          >
                            {trans[locate].submit_ratting}
                          </button>
                        )}
                      </form>
                    </>
                  )}

                {commentsRating.length > 0 &&
                  [...commentsRating]
                    .sort(
                      (a, b) =>
                        -new Date(a.createdAt).getTime() +
                        new Date(b.createdAt).getTime()
                    )
                    .slice((pagCurrent - 1) * 5, 5 * pagCurrent)
                    .map((item) => {
                      return (
                        <div key={item._id} className="feadback-item">
                          <div className="d-flex">
                            <div className="flex-shrink-1 d-flex">
                              <div style={{ marginRight: 10 }}>
                                <img
                                  style={{
                                    borderRadius: "100%",
                                    width: 50,
                                    height: 50,
                                  }}
                                  src={
                                    item?.userId?.avatarUrl ||
                                    "https://via.placeholder.com/70x70"
                                  }
                                  alt="image"
                                />
                              </div>
                            </div>
                            <div className="info">
                              <div style={{ lineHeight: "21px" }}>
                                <span className="name-user">
                                  {item.userId?.name}{" "}
                                </span>
                                <div className="d-flex align-items-center">
                                  {[1, 2, 3, 4, 5].map((value) => {
                                    if (value <= parseInt(item.ratting)) {
                                      return (
                                        <i
                                          style={{
                                            color: "#ff8800",
                                            fontSize: 12,
                                            marginRight: 3,
                                          }}
                                          className="fa-solid fa-star"
                                        ></i>
                                      );
                                    } else {
                                      return (
                                        <i
                                          style={{
                                            color: "#99a2aa",
                                            fontSize: 12,
                                            marginRight: 3,
                                          }}
                                          className="fa-solid fa-star"
                                        ></i>
                                      );
                                    }
                                  })}

                                  <span className="time ms-1">
                                    {moment(item.createdAt).fromNow()}
                                  </span>
                                </div>
                              </div>
                              <p
                                className="content mt-1"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>

              {commentsRating.length > 0 && (
                <div className="d-flex justify-content-end mb-3 me-3 align-items-center">
                  <Pagination
                    defaultCurrent={1}
                    total={commentsRating.length}
                    pageSize={5}
                    onChange={(page, pageSize) => {
                      setPagCurrent(page);
                    }}
                  />
                </div>
              )}
            </div>

            <div
              className="list-comment mt-4 list-feedback"
              style={{ position: "relative" }}
            >
              <h5 className="heading d-flex">
                {trans[locate].question_and_answer}
              </h5>

              <div className="list-comment--content">
                <form
                  onSubmit={commentQA__create}
                  style={{ position: "relative" }}
                >
                  <textarea
                    onChange={(e) => setMessageCommentQA(e.target.value)}
                    value={messageCommentQA}
                    name="input-content"
                    placeholder={trans[locate].write_question}
                    className="input-content"
                    style={{ width: "100%" }}
                    rows={2}
                  ></textarea>
                  <button
                    type="submit"
                    className="btn-primary-light btn-submit"
                    style={{ fontWeight: "normal" }}
                  >
                    {trans[locate].submit_question}
                  </button>
                </form>

                {commentsQA
                  .sort(
                    (a, b) =>
                      -new Date(a.createdAt).getTime() +
                      new Date(b.createdAt).getTime()
                  )
                  .slice((pageQACurrent - 1) * 5, 5 * pageQACurrent)
                  .map((item, index) => {
                    return (
                      <FeedbackItem
                        data={item}
                        commentQA__create={commentQA__create}
                      />
                    );
                  })}
              </div>

              {commentsQA.length > 0 && (
                <div className="d-flex justify-content-end mb-3 me-3 align-items-center">
                  <Pagination
                    defaultCurrent={1}
                    total={commentsQA.length}
                    pageSize={5}
                    onChange={(page, pageSize) => {
                      setPageQACurrent(page);
                    }}
                  />
                </div>
              )}

              {loadingCommentQA && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 100,
                    backgroundColor: "#0000004d",
                  }}
                  className="d-flex justify-content-center align-items-center"
                >
                  <CircleSpinner color="#fff" />
                </div>
              )}
            </div>

            {/* Product recommend */}
            <div className="mt-4 mb-4 mb-xl-0">
              <DynamicSliderProductItem products={productRecommend} />
            </div>
          </div>
          <div className="col-12 col-xl-5 d-none d-xl-block">
            {/* Right column desktop */}
            <div style={{ position: "sticky", top: 20 }}>
              <div
                ref={colInfoProduct}
                style={{ maxHeight: "100vh", overflowY: "auto" }}
                className="d-flex flex-column justify-content-between"
              >
                {/* Info */}
                <div className="d-none d-xl-block">
                  <Tooltip
                    placement="top"
                    title={`${product.digitalInfo.assetName[locate]} (${product.digitalInfo.assetSymbol[locate]})`}
                  >
                    <h1
                      className="text-uppercase fs-5 line-clamp-2 fw-bold mb-0"
                      style={{}}
                    >
                      <span style={{ color: "#acacac" }}>#</span>
                      <span style={{ color: "red" }}>{product.nftId}</span>{" "}
                      {product.digitalInfo.assetName[locate]}{" "}
                    </h1>
                  </Tooltip>
                  <h2
                    className="mb-2 mt-2"
                    style={{ lineHeight: 0, color: "#000000d9" }}
                  >
                    <span
                      className=""
                      style={{
                        fontSize: 14,
                        color: "#000000d9",
                      }}
                    >
                      {product.digitalInfo?.assetAddress?.slice(0, 6)}...
                      {product.digitalInfo?.assetAddress?.slice(-6)}
                    </span>
                    <a
                      onClick={() => {
                        copy(product.digitalInfo?.assetAddress);
                      }}
                      className="copy a-none"
                      style={{ fontSize: 14 }}
                      role="button"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </a>
                  </h2>
                  {/* Rating */}
                  <div className="d-flex gap-1 mb-1 mt-3">
                    {[1, 2, 3, 4, 5].map((item) => {
                      if (item <= ratting) {
                        return (
                          <i
                            key={item}
                            style={{ color: "#ff8800" }}
                            className="fa-solid fa-star me-1"
                          ></i>
                        );
                      } else
                        return (
                          <i
                            key={item}
                            style={{ color: "#99a2aa" }}
                            className="fa-solid fa-star me-1"
                          ></i>
                        );
                    })}
                  </div>

                  {product?.assetType == "single_asset" && id && (
                    <>
                      <div className="mt-2">
                        <span
                          className="d-flex"
                          style={{
                            color: "#ff8800",
                            fontSize: 20,
                            textTransform: "capitalize",
                          }}
                        >
                          {product.price != null ? (
                            <>
                              {!loadingPrice ? (
                                product.price?.toLocaleString("vi-VN")
                              ) : (
                                <Skeleton style={{ width: 50 }} />
                              )}{" "}
                              VND/ {trans[locate].portion}
                            </>
                          ) : (
                            trans[locate].not_open_for_sale_yet
                          )}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="d-flex" style={{ color: "#585858" }}>
                          Pool Size:{" "}
                          {loadingPoolSize ? (
                            <Skeleton style={{ width: 50, marginLeft: 5 }} />
                          ) : (
                            <>
                              {product.poolSize?.stableCoin
                                ? formatCurrency(
                                    product.poolSize?.stableCoin?.toString()
                                  )
                                : "N/A"}{" "}
                              VND ~{" "}
                              {product.poolSize?.asset
                                ? formatCurrency(
                                    product.poolSize?.asset?.toString()
                                  )
                                : "N/A"}{" "}
                              {product.digitalInfo.assetSymbol[locate]}
                            </>
                          )}
                          {loadFailedPoolSize && (
                            <a
                              role={"button"}
                              onClick={() => getPoolSize()}
                              className="ms-2 a-none"
                            >
                              <i className="fa-regular fa-rotate-right"></i>
                            </a>
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  {product?.assetType == "collection_asset" && id && (
                    <div className="mt-2">
                      <span style={{ color: "#585858" }}>
                        {trans[locate].total_supply} {trans[locate].project}:{" "}
                        <span style={{ color: "#111" }}>
                          {totalSupply} {trans[locate].product}
                        </span>
                      </span>
                    </div>
                  )}

                  {product?.assetType == "fund_rising_pool" && (
                    <>
                      <div className="mt-2 d-flex flex-column gap-1">
                        <div style={{ color: "#585858" }}>
                          {trans[locate].total_supply} {trans[locate].project}:{" "}
                          <span style={{ color: "#111" }}>
                            {product.digitalInfo.totalSupply.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            {trans[locate].product}
                          </span>
                        </div>
                        <div style={{ color: "#585858" }}>
                          {trans[locate].type}:{" "}
                          <span style={{ color: "#ff8800", fontWeight: 700 }}>
                            {trans[locate].certificate_of_investment}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Sold */}
                  {["single_asset", "collection_asset"].includes(
                    product.assetType
                  ) && <SoldProduct />}
                </div>

                {/* Payment on desktop */}
                {product?.assetType == "single_asset" && (
                  <BoxSwap
                    product={product}
                    onConfirmSuccess={async () => {
                      await getUnitPrice(product?.digitalInfo?.assetAddress);
                      await getPoolSize(pairAddress);
                      await getProductRecommend();
                    }}
                    loading={loadingBoxSwap}
                    onUpdatePrice={(price) => {
                      setUnitPrice(price);
                    }}
                  />
                )}

                {product?.assetType == "collection_asset" && !loadingAsset && (
                  <>
                    <BoxTradeCollection
                      asset={product}
                      onChangeNftIdSelected={setNftIdSelected}
                    />
                  </>
                )}

                {product?.assetType == "fund_rising_pool" && !loadingAsset && (
                  <BoxTradeRisingPool asset={product} />
                )}
              </div>
            </div>
          </div>
        </div>

        <img
          className="d-none d-xl-block"
          style={{
            position: "absolute",
            bottom: -160,
            left: -100,
            zIndex: -1,
          }}
          src="/img/item-pillar.svg"
          alt="image"
        />
        <img
          className="d-none d-xl-block"
          style={{
            position: "absolute",
            bottom: -160,
            right: -50,
            zIndex: -1,
          }}
          src="/img/item-pillar-2.svg"
          alt="image"
        />
      </div>
    </PageLayout>
  );
}

const ItemParties = (data: {
  role: string;
  name: string;
  roleId: string;
  organizationId: string;
  rolesOrganization: IRoleOrganization[];
}) => {
  const { locate } = useSelector(locateSelector);
  const [organization, setOrganization] = useState<Organization>(
    new Organization()
  );

  useEffect(() => {
    (async () => {
      if (data.organizationId) {
        let res = await organizationApi.getOne(data.organizationId);
        setOrganization(new Organization(res));
      }
    })();
  }, [data.organizationId]);

  return (
    <>
      <span className="blur">
        {data.roleId
          ? data.rolesOrganization.find((item) => item.role == data.roleId)
              ?.name[locate]
          : data.role}
      </span>
      <div className="d-flex align-items-center gap-2">
        {data.organizationId && data.roleId ? (
          <>
            <Image
              src={organization.imageUrl || "/img/logo-diamond-gold.png"}
              placeholder="blur"
              blurDataURL="/img/logo-diamond-gold.png"
              width={30}
              height={30}
              alt="image"
            />
            <span className="dark">{organization.name[locate]}</span>
          </>
        ) : (
          <span className="dark">{data.name}</span>
        )}
      </div>
    </>
  );
};
