import { TAssetType } from "src/models/asset/real_estate.model";
import { TSmartContract } from "src/models/smart_contract.model";


// Human
export const getHumans = (type: 'team'|'advisor'|'partner') => `${process.env.API_PREFIX_RETX}/v1/human/list?type=${type}`;

// News
export const getNews = (type: 'market' | 'company', limit?: number, page?: number) => `${process.env.API_PREFIX_RETX}/v1/news/query?type=${type}&limit=${limit}&page=${page}`

// Contact
export const getContact = `${process.env.API_PREFIX_RETX}/v1/contact`
export const sendMessage = `${process.env.API_PREFIX_IDENTITY}/v1/support`

// Asset
export const getAssets = `${process.env.API_PREFIX_RETX}/v1/assets/real-estate/web-user`
export const getAsset = (id: string) => `${process.env.API_PREFIX_RETX}/v1/assets/real-estate/${id}/web-user`
export const assetTransactions = (id: string) => `${process.env.API_PREFIX_RETX}/v1/assets/transactions/` + id
export const commentProduct = `${process.env.API_PREFIX_RETX}/v1/assets/comments`
export const commentsByProduct = (id: string) => `${process.env.API_PREFIX_RETX}/v1/assets/comments/`+id
export const getRealEstateInfo = `${process.env.API_PREFIX_RETX}/v1/assets/real-estate/info`
export const commentQA__create = `${process.env.API_PREFIX_RETX}/v1/assets/comments/qa`
export const commentQA__list = (id: string) => `${process.env.API_PREFIX_RETX}/v1/assets/comments/qa/` + id
export const commentQA__update = `${process.env.API_PREFIX_RETX}/v1/assets/comments/qa/update`
export const decodeInputBlock = `${process.env.API_PREFIX_RETX}/v1/assets/transaction/decode-input`
export const decodeInputBlockV2 = `${process.env.API_PREFIX_RETX}/v1/assets/transaction/decode-input/v2`
export const getTransactionByToken = (address: string, network: string) => `${process.env.API_PREFIX_RETX}/v1/assets/transactions/token/${address}/${network}`
export const getSellers = `${process.env.API_PREFIX_RETX}/v1/assets/real-estate/sellers`
export const cacheDataAsset = (assetId: string, fieldname: string) => `${process.env.API_PREFIX_RETX}/v1/assets/real-estate/cache-data/${assetId}/${fieldname}`
export const pinataURI = (cid: string) => `/api/pinata-uri?cid=${cid}`
export const getAssetBlockTransactions = (assetAddress: string) => `${process.env.API_PREFIX_RETX}/v1/assets/block-transactions/address/${assetAddress}`
export const updateAssetTransactions = (assetAddress: string) => `${process.env.API_PREFIX_RETX}/v1/assets/transactions/address/${assetAddress}`
export const getAssetTransactions = (assetAddress: string) => `${process.env.API_PREFIX_RETX}/v1/assets/transactions/address/${assetAddress}`
export const addAssetBlockTransaction = (assetAddress: string) => `${process.env.API_PREFIX_RETX}/v1/assets/block-transactions/address/${assetAddress}`



// ------- Locations -------
export const getLocations = `${process.env.API_PREFIX_RETX}/v1/locations`

// Banner
export const getBanners = `${process.env.API_PREFIX_RETX}/v1/banner`

// Auth
export const login = `${process.env.API_PREFIX_IDENTITY}/v1/users/login`
export const logout =`${process.env.API_PREFIX_IDENTITY}/v1/system_users/logout`
export const authenticate =`${process.env.API_PREFIX_IDENTITY}/v1/users/me/info`

// User
export const registerNewUser = `${process.env.API_PREFIX_IDENTITY}/v1/users/register`
export const validateUserRegister = `${process.env.API_PREFIX_IDENTITY}/v1/users/register/validate`
export const validatePhoneNumber = (data:{userId:string, phoneNumber: string}) => `/users/info/phone-number/validate/${data.userId}/${data.phoneNumber}` // remove
export const updatePhoneNumber = `${process.env.API_PREFIX_IDENTITY}/v1/users/info/phone_number`
export const getTransactionStableCoin = `/users/contract/stable-coin/transactions` // remove
export const userRegisterVerifyEmailResend = `/users/register/verify/email/resend` // remove
export const userUpdateWallet = `${process.env.API_PREFIX_IDENTITY}/v1/users/info/wallet`
export const recognizeIdCard = `${process.env.API_PREFIX_IDENTITY}/v1/users/recognize_id_card`
export const usersUpdateKyc =`${process.env.API_PREFIX_IDENTITY}/v1/users/kyc`
export const userUploadAvatar = `${process.env.API_PREFIX_IDENTITY}/v1/avatar/upload`
export const userRemoveAvatar = `${process.env.API_PREFIX_IDENTITY}/v1/avatar/remove`
export const userUpdatePassword = `${process.env.API_PREFIX_IDENTITY}/v1/users/info/password`
export const userCartAdd = `${process.env.API_PREFIX_RETX}/v1/cart/add`
export const userCartRemove = (cartId: string) => `${process.env.API_PREFIX_RETX}/v1/cart/${cartId}/remove`
export const userCartList = (assetType: TAssetType | 'all') => `${process.env.API_PREFIX_RETX}/v1/cart/asset-type/${assetType}/list`
export const userMyRating = `${process.env.API_PREFIX_RETX}/v1/rating/me`
export const userDeleteMyRating = (commentId : string)=> `${process.env.API_PREFIX_RETX}/v1/rating/`+commentId
export const userCheckIdCard = (idCard: string) => `${process.env.API_PREFIX_IDENTITY}/v1/users/check_id_card/` + idCard 
export const isExistUsername = (username: string) => `${process.env.API_PREFIX_RETX}/v1/users/is-exist-username/${username}`
export const userUpdateEmail =`${process.env.API_PREFIX_IDENTITY}/v1/users/info/email`
export const userForgotPassword = `${process.env.API_PREFIX_IDENTITY}/v1/users/forgot_password`
export const getInfoUserByWallet = (walletAddress: string) => `${process.env.API_PREFIX_IDENTITY}/v1/users/wallet_address/${walletAddress}`
export const updateP2PTransaction = `${process.env.API_PREFIX_RETX}/v1/p2p-transaction`
export const getP2PTransaction = `${process.env.API_PREFIX_RETX}/v1/p2p-transaction/me`


// Transaction
export const banksList = `${process.env.API_PREFIX_TOPUP}/v1/bank_accounts/users/banks`
export const bankAccountsList = `${process.env.API_PREFIX_TOPUP}/v1/bank_accounts/users`
export const topupConfirm = (userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/topup/users/${userId}/confirm`
export const getTopupTransactionInit = (userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/topup/users/${userId}/transactions/initialize`
export const finishedTopupTransaction = (userId: string, transactionId: string) => `${process.env.API_PREFIX_TOPUP}/v1/topup/users/${userId}/transactions/${transactionId}/status`    
export const createWithdrawTransaction =(userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/withdraw/users/${userId}/transactions`
export const getWithdrawTransactionPending = (userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/withdraw/users/${userId}/transactions/not_done`
export const getTopupTransactions = (userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/topup/users/${userId}/transactions`
export const getWithdrawTransactions = (userId: string) => `${process.env.API_PREFIX_TOPUP}/v1/withdraw/users/${userId}/transactions`
export const cancelWithdrawTransaction = (userId: string, transactionId: string) => `${process.env.API_PREFIX_TOPUP}/v1/withdraw/users/${userId}/transactions/${transactionId}/status`
export const getAllTransactionsContract = `${process.env.API_PREFIX_RETX}/v1/assets/contract/transactions`
export const asyncTransactionsContract = `${process.env.API_PREFIX_RETX}/v1/assets/contract/transactions/async`
export const addTransactionsContract = `${process.env.API_PREFIX_RETX}/v1/assets/contract/transactions/add`


// ------- OTP --------
export const otpSend = `${process.env.API_PREFIX_IDENTITY}/v1/otp/create`
export const otpVerify = `${process.env.API_PREFIX_IDENTITY}/v1/otp/verify`

// ------- Contract --------
export const getContract = (type: TSmartContract | string, chainId: string) => `${process.env.API_PREFIX_SCM}/v1/smart_contract/${type}/${chainId}`


// ------- Organization --------
export const getOrganization = (id: string) => `${process.env.API_PREFIX_RETX}/v1/organization/${id}`
export const getRolesOrganization = `${process.env.API_PREFIX_RETX}/v1/organization/roles`

// Form Real Estate Asset
export const listFormRealEstateAsset = `${process.env.API_PREFIX_RETX}/v2/assets/real-estate/form`

// Notification
export const notification = `${process.env.API_PREFIX_NOTIFICATION}/v1/notifications`
