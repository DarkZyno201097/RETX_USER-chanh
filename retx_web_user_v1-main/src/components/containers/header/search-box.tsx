import { assetActions } from "@store/actions"
import { assetSelector } from "@store/asset/asset.slice"
import { locateSelector } from "@store/locate/locate.slice"
import { routeNames } from "@utils/router"
import { slugify } from "@utils/string"
import Image from "next/image"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import { ClassicSpinner } from "react-spinners-kit"
import { RealEstateAssetView } from "src/models/asset/real_estate.model"
import { trans } from "src/resources/trans"

const SearchBox = ({ onClickItem, loadingGetProductSuggest, productSuggest }: {
    onClickItem: () => void,
    loadingGetProductSuggest: boolean,
    productSuggest: RealEstateAssetView[],
}) => {

    const { locate } = useSelector(locateSelector)
    const dispatch = useDispatch()
    const {
        textSearchingProduct
    } = useSelector(assetSelector)
    const router = useRouter()


    return (
        <div className="search-history">
            <ul>
                {JSON.parse(localStorage.getItem('search_history')).filter(item => !!item && slugify(item).includes(slugify(textSearchingProduct))).reverse().slice(0, 3).map((item) => (
                    <li key={item}>
                        <a
                            onMouseDown={() => {
                                dispatch(assetActions.self.onChangeSearch(item))
                                router.push(routeNames.product + `?search=${item}`)
                                // onClickItem()
                            }}
                            role="button">
                            <span>{item}</span>
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </a>
                    </li>
                ))}
                {JSON.parse(localStorage.getItem('search_history')).length == 0 && (
                    <li>
                        <a role="button">{trans[locate].no_search_history_yet}</a>
                    </li>
                )}
            </ul>
            <div className="px-2 py-1 d-flex gap-3 align-items-center" style={{ backgroundColor: '#d9d9d9' }}>
                <span>
                    {trans[locate].product_suggested}
                </span>
                {loadingGetProductSuggest && (
                    <span>
                        <ClassicSpinner color="#ff8800" size={18} />
                    </span>
                )}

            </div>
            <ul className="search-box--product-item">
                {productSuggest.map(item => {
                    return (
                        <li key={item._id}>
                            <a role={'button'} onMouseDown={async () => {
                                await router.push(`${routeNames.product}/${item._id}`)
                                // router.reload()
                            }} className="flex justify-content-start gap-3">
                                <Image src={item.avatarUrl} width={100} height={100 * 3 / 4} alt="image" />
                                <div className="d-flex flex-column">
                                    <span style={{ textTransform: 'uppercase' }}>{item.digitalInfo.assetName[locate]}</span>
                                    <span style={{ color: '#ff8800' }}>{item.digitalInfo.totalSupply} {trans[locate].portion}</span>
                                </div>
                            </a>
                        </li>
                    )
                })}
                {productSuggest.length == 0 && !loadingGetProductSuggest && (
                    <span className="p-3 d-block text-center">{trans[locate].no_data}</span>
                )}
            </ul>
        </div>
    )
}

export default SearchBox;