module.exports = {
    env: {
        ENDPOINT: process.env.ENDPOINT,
        API_PREFIX_RETX: process.env.API_PREFIX_RETX,
        API_PREFIX_SCM: process.env.API_PREFIX_SCM,
        API_PREFIX_TOPUP: process.env.API_PREFIX_TOPUP,
        API_PREFIX_IDENTITY: process.env.API_PREFIX_IDENTITY,
        API_PREFIX_NOTIFICATION: process.env.API_PREFIX_NOTIFICATION,
        PRC_URL_DEFAULT: process.env.PRC_URL_DEFAULT,
        CHAIN_ID_HEX_DEFAULT: process.env.CHAIN_ID_HEX_DEFAULT,
        GATEWAY_PINATA: process.env.GATEWAY_PINATA
    },
    images: {
        domains: ["res.cloudinary.com", "hoaigiangshop.net", "via.placeholder.com"],
    },
}