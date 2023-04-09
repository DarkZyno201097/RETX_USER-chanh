import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Slider, Pagination, InputNumber, List, Button, Select, Drawer, Empty } from 'antd';
import Skeleton from "react-loading-skeleton";
import _, { filter } from 'lodash'

import { assetActions } from "@store/actions";
import ProductItem from "@components/box/product_item";
import PageLayout from "@layouts/page";
import { assetSelector } from "@store/asset/asset.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { assetApi } from "@apis/index";
import { trans } from "src/resources/trans";
import LocationFilter from "@components/box/location_filter";
import TypeAssetFilter from "@components/box/type_asset_filter";
import DirectionAssetFilter from "@components/box/direction_asset_filter";
import { IFieldTopFilter, IFilterAssetOption, IFilterSelected, IFilterAssetValue, IValueTopFilter } from "src/models/asset/filter_options";
import { slugify } from "@utils/string";
import { RealEstateAssetView, TAssetType } from "src/models/asset/real_estate.model";
import { IPaginateData } from "src/models/paginate-data.interface";
import { Organization } from "src/models/organization.model";
import { FormRealEstateAsset } from "src/models/asset/form-real-estate.model";
import { useRouter } from "next/router";
import AssetTypeFilter from "@components/box/asset_type_filter";


interface IRealEstateInfo {
    id: string;
    translates: {
        [key: string]: any
    }
}





export default function ProductPage() {
    const dispatch = useDispatch()
    const { assets, filterBySeller, dataProducts, loadingDataProducts, textSearchProduct } = useSelector(assetSelector)
    const { locate, locations } = useSelector(locateSelector)
    const router = useRouter()
    const boxLoadingRef = useRef<HTMLDivElement>()

    const [infoBase, setInfoBase] = useState<{ type: IRealEstateInfo[], directions: IRealEstateInfo[] }>({
        type: [],
        directions: [],
    })
    const [filterOptions, setFilterOptions] = useState<IFilterAssetOption>({
        location: {
            cityCode: null,
            districtCode: null,
            wardCode: null,
        },
        form: [],
        directions: [],
        rangePrice: {
            min: null,
            max: null
        },
        rangeArea: {
            min: null,
            max: null
        },
        sellers: filterBySeller ? [filterBySeller] : [],
        timeCreated: 'asc',
        view: null,
        numberOfComments: null,
        rating: null,
        totalSupply: null,
        assetType: null,
    })
    const [openModalFilter, setOpenModalFilter] = useState(false)

    const [sellers, setSellers] = useState<Organization[]>()
    const [listFormRealEstateAsset, setListFormRealEstateAsset] = useState<FormRealEstateAsset[]>([])
    const [sellersSelected, setSellersSelected] = useState<string[]>([])
    const [sortBy, setSortBy] = useState<keyof IFilterAssetOption | 'exactSearch'>('timeCreated')
    const [sortValue, setSortValue] = useState<IFilterAssetValue>('asc')
    const [formTypeAssetFilter, setFormTypeAssetFilter] = useState<string[]>([])
    const [placementModalFilter, setPlacementModalFilter] = useState<"bottom" | "top" | "right" | "left">('right')
    const [directionAssetFilter, setDirectionAssetFilter] = useState<string[]>([])
    const [locationAssetFilter, setLocationAssetFilter] = useState({
        cityCode: '',
        districtCode: '',
        wardCode: ''
    })
    const [currentLoadPrice, setCurrentLoadPrice] = useState(0)

    const SortLabelOfASC = {
        timeCreated: trans[locate].latest,
        view: trans[locate].most,
        numberOfComments: trans[locate].most,
        rating: trans[locate].highest,
        totalSupply: trans[locate].highest,
    }

    const SortLabelOfDEC = {
        timeCreated: trans[locate].oldest,
        view: trans[locate].least,
        numberOfComments: trans[locate].least,
        rating: trans[locate].lowest,
        totalSupply: trans[locate].lowest,
    }


    useEffect(() => {
        (async () => {
            let data: any = await assetApi.getRealEstateInfo()
            setInfoBase(data.data)

            let dataSellers = await assetApi.getSellers()
            setSellers(dataSellers)

            let dataForm = await assetApi.listFormRealEstateAsset()
            setListFormRealEstateAsset(dataForm)
        })()
    }, [])


    const onChangeSorting = async (by: string, value: any) => {
        let temp = { ...filterOptions }

        temp.timeCreated = null;
        temp.view = null
        temp.numberOfComments = null
        temp.rating = null;
        temp.totalSupply = null;

        temp[by] = value

        dispatch(assetActions.getDataProducts({
            page: 1,
            limit: dataProducts.paginate.limit,
            filterObj: temp,
            search: router.query.search  as string || ''
        }))
        setSortBy(by as any)
        setSortValue(value)
        setFilterOptions(temp)
    }

    const onChangeFilterForm = async (values: string[]) => {
        let temp = { ...filterOptions }
        temp.form = values
        setFilterOptions(temp)
        dispatch(assetActions.getDataProducts({
            page: 1,
            limit: dataProducts.paginate.limit,
            filterObj: { ...temp, form: values },
            search: router.query.search  as string || ''
        }))

    }

    const [assetTypeFilter, setAssetTypeFilter] = useState<TAssetType>(null)

    const onChangeFilterRangeArea = (fieldname: 'min' | 'max', value: number) => {
        let tempFilters = { ...filterOptions }
        let tempRangeArea = { ...tempFilters.rangeArea }
        tempRangeArea[fieldname] = value
        tempFilters.rangeArea = tempRangeArea
        setFilterOptions(tempFilters)
    }

    const sellerQuery = router.query.seller as string;
    const searchQuery = router.query.search as string;

    useEffect(()=>{
        if (dataProducts.data.length > 0){
            setCurrentLoadPrice(0)
        }
    },[dataProducts])

    useEffect(() => {
        if (searchQuery && !sellerQuery){
            setSortBy('exactSearch')
            dispatch(
              assetActions.getDataProducts({
                page: 1,
                limit: dataProducts.paginate.limit,
                search: searchQuery || "",
                filterObj: {},
              })
            );
            dispatch(assetActions.self.onChangeSearch(searchQuery || ''))
        }
        else{
          dispatch(assetActions.self.onChangeSearch(''))
        }

        if (sellerQuery) {
            let temp = { ...filterOptions }
            setSellersSelected([sellerQuery])
            temp.sellers = [sellerQuery]
            setFilterOptions(temp)
            dispatch(assetActions.getDataProducts({
                page: 1,
                limit: dataProducts.paginate.limit,
                filterObj: { ...filterOptions, sellers: [sellerQuery] },
                search: searchQuery
            }))
        }

        if (!sellerQuery && !searchQuery){
            onChangeSorting('timeCreated', 'asc')
        }

    }, [sellerQuery, searchQuery])


    const FilterProjectOwner = ({ hiddenConfirm }: {
        hiddenConfirm?: boolean
    }) => {
        return (
            <div className="col-12 mt-4 mt-xl-0">
                <div className="price_rage h-100 pb-2">
                    <label style={{ marginBottom: '0px', color: '#505050', fontWeight: 600, textTransform: 'capitalize' }} htmlFor="customRange2" className="form-label p-2">{trans[locate].project_owner}</label>
                    <div className="px-2">
                        <div className="mb-2">
                            <Select
                                mode="multiple"
                                placeholder={trans[locate].choose_a_project_owner}
                                showArrow
                                value={sellersSelected}
                                onChange={setSellersSelected}
                                style={{ width: '100%' }}
                                options={sellers?.map((item) => {
                                    return {
                                        label: item.name[locate],
                                        value: item._id
                                    }
                                })}
                                optionFilterProp="children"
                                filterOption={(input, option) => slugify((option?.label ?? '')).includes(slugify(input))}
                                filterSort={(optionA, optionB) =>
                                    slugify((optionA?.label ?? '')).localeCompare(slugify((optionB?.label ?? '')))
                                }
                            />
                        </div>

                        {!hiddenConfirm && (
                            <Button
                                onClick={async () => {
                                    let temp = { ...filterOptions }
                                    temp.sellers = sellersSelected
                                    setFilterOptions(temp)
                                    dispatch(assetActions.getDataProducts({
                                        page: 1,
                                        limit: dataProducts.paginate.limit,
                                        filterObj: { ...filterOptions, sellers: sellersSelected },
                                        search: router.query.search  as string || ''
                                    }))
                                }}
                                block
                            >
                                {trans[locate].confirm}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
      <PageLayout>
        <Drawer
          title={
            <div
              className="d-flex justify-content-center"
              style={{
                position: "relative",
              }}
            >
              <h5 className="mb-0">{trans[locate].section_filter}</h5>
              <a
                onClick={() => {
                  setOpenModalFilter(false);
                }}
                role="button"
                className="a-none bg-white d-flex justify-content-center align-items-center"
                style={{
                  color: "#fec128",
                  fontSize: 25,
                  width: 25,
                  height: 25,
                  borderRadius: 5,
                  position: "absolute",
                  right: 0,
                }}
              >
                <i className="fa-regular fa-xmark"></i>
              </a>
            </div>
          }
          placement={placementModalFilter}
          closable={false}
          onClose={() => setOpenModalFilter(false)}
          visible={openModalFilter}
          key={"filter-on-mobile"}
          height={"70%"}
          footer={
            <div className="d-flex justify-content-between align-items-center gap-3">
              <button
                onClick={() => {
                  let temp = { ...filterOptions };
                  temp.sellers = sellersSelected;
                  temp.form = formTypeAssetFilter;
                  temp.directions = directionAssetFilter;
                  temp.location = locationAssetFilter;
                  temp.assetType = assetTypeFilter;
                  setFilterOptions(temp);
                  dispatch(
                    assetActions.getDataProducts({
                      page: 1,
                      limit: dataProducts.paginate.limit,
                      filterObj: { ...temp },
                      search: (router.query.search as string) || "",
                    })
                  );
                  setOpenModalFilter(false);
                }}
                className="a-none btn-explore d-block w-100 mt-0 text-white"
              >
                <span>{trans[locate].view_results}</span>
              </button>
              <button
                className="btn-none"
                style={{
                  border: "2px solid #FF8800",
                  borderRadius: 8,
                  width: 48,
                  height: 48,
                  aspectRatio: "1",
                }}
                onClick={() => {
                  let temp = { ...filterOptions };
                  temp.sellers = [];
                  temp.form = [];
                  temp.directions = [];
                  temp.location = {
                    cityCode: null,
                    districtCode: null,
                    wardCode: null,
                  };
                  temp.assetType = null;
                  setFormTypeAssetFilter([]);
                  setSellersSelected([]);
                  setDirectionAssetFilter([]);
                  setLocationAssetFilter(temp.location);
                  setFilterOptions(temp);
                  setAssetTypeFilter(null);
                  dispatch(
                    assetActions.getDataProducts({
                      page: 1,
                      limit: dataProducts.paginate.limit,
                      filterObj: { ...temp },
                      search: (router.query.search as string) || "",
                    })
                  );
                  setOpenModalFilter(false);
                }}
              >
                <span className="fs-5" style={{ color: "#FF8800" }}>
                  <i className="fa-light fa-arrows-rotate"></i>
                </span>
              </button>
            </div>
          }
        >
          <div className="d-flex flex-column gap-3">
            <FilterProjectOwner hiddenConfirm />

            <TypeAssetFilter
              filterOptions={filterOptions}
              listForm={listFormRealEstateAsset}
              hiddenConfirm
              values={formTypeAssetFilter}
              onChange={setFormTypeAssetFilter}
            />

            <DirectionAssetFilter
              filterOptions={filterOptions}
              infoBase={infoBase}
              values={directionAssetFilter}
              onChange={setDirectionAssetFilter}
            />

            <LocationFilter
              filterOptions={filterOptions}
              values={locationAssetFilter}
              onChange={setLocationAssetFilter}
            />

            <AssetTypeFilter
              filterOptions={filterOptions}
              value={assetTypeFilter}
              onChange={setAssetTypeFilter}
            />
          </div>
        </Drawer>

        <div
          className="section container-fluild container-xl mt-4"
          style={{ position: "relative" }}
        >
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
          <div style={{}} />
          {/* item */}
          <div
            className="content d-flex flex-column-reverse  flex-xl-row row"
            style={{ position: "relative" }}
          >
            <div
              style={{
                backgroundColor: "#FFF6E5",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -2,
              }}
            />

            <div className="col-xl-12">
              <div className="row py-4">
                <div className="mb-3 d-flex align-items-xl-center gap-2 gap-xl-3 sort-section flex-xl-row flex-column">
                  <b style={{ fontSize: 14, color: "#505050", width: 100 }}>
                    {trans[locate].sorted_by}
                  </b>
                  <div className="d-flex align-items-xl-center justify-content-between gap-2 gap-xl-3 w-100">
                    <div className="d-flex gap-2">
                      <Select
                        value={
                          !textSearchProduct && sortBy == "exactSearch"
                            ? ""
                            : sortBy
                        }
                        style={{ width: "auto" }}
                        onChange={(value: any) => {
                          setSortBy(value)
                          if (value != "exactSearch") {
                            onChangeSorting(value, sortValue);
                          }
                        }}
                        options={[
                          ...(textSearchProduct && [
                            {
                              value: "exactSearch",
                              label: trans[locate].exact_search,
                            },
                          ]),
                          ...[
                            {
                              value: "timeCreated",
                              label: trans[locate].creation_time,
                            },
                            {
                              value: "view",
                              label: trans[locate].count_view,
                            },
                            {
                              value: "numberOfComments",
                              label: trans[locate].discussion,
                            },
                            {
                              value: "rating",
                              label: trans[locate].rating,
                            },
                            {
                              value: "totalSupply",
                              label: trans[locate].total_supply,
                            },
                          ],
                        ]}
                      />
                      {sortBy != "exactSearch" && (
                        <Select
                          value={sortValue}
                          style={{ width: "auto" }}
                          onChange={(value) => {
                            setSortValue(value as any)
                            onChangeSorting(sortBy, value);
                          }}
                          options={[
                            {
                              value: "asc",
                              label: SortLabelOfASC[sortBy],
                            },
                            {
                              value: "dec",
                              label: SortLabelOfDEC[sortBy],
                            },
                          ]}
                        />
                      )}
                    </div>

                    <div className="">
                      <Button
                        onClick={() => {
                          setOpenModalFilter(true);
                          setSellersSelected(filterOptions.sellers);
                          setFormTypeAssetFilter(filterOptions.form);
                        }}
                        className="d-flex align-items-center justify-content-center gap-2"
                      >
                        <span>
                          <i className="fa-light fa-filter"></i>
                        </span>
                        <span>{trans[locate].section_filter}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {textSearchProduct && (
                  <div
                    style={{ lineHeight: "1" }}
                    className="d-flex justify-content-start align-items-center"
                  >
                    <h5 className="m-0 text-result-search-product d-flex">
                      {
                        trans[
                          locate
                        ].there_are_number_search_results_for_the_keyword.split(
                          ":number"
                        )[0]
                      }
                      <span className="mx-1">
                        {loadingDataProducts ? (
                          <Skeleton width={50} />
                        ) : (
                          dataProducts.data.length
                        )}
                      </span>
                      {
                        trans[
                          locate
                        ].there_are_number_search_results_for_the_keyword.split(
                          ":number"
                        )[1]
                      }
                      <b>"{textSearchProduct}"</b>
                    </h5>
                    <a
                      onClick={() => {
                        dispatch(assetActions.self.onChangeSearch(''))
                        dispatch(assetActions.getDataProducts({
                            page: 1,
                            filterObj: filterOptions,
                            search: ''
                        }))
                        setSortBy('timeCreated')
                        router.push("?");
                      }}
                      role="button"
                    >
                      <i
                        style={{ fontSize: 20 }}
                        className="fa-regular ms-2 fa-circle-xmark text-danger"
                      ></i>
                    </a>
                  </div>
                )}

                {!loadingDataProducts && dataProducts.data.length == 0 && (
                  <Empty description={trans[locate].no_data} />
                )}

                {loadingDataProducts &&
                  [1, 2, 3, 4].map((item) => (
                    <div key={item} className="col-xl-3 col-6 mb-4">
                      <Skeleton
                        style={{
                          width: "100%",
                          aspectRatio: "3/4",
                        }}
                      />
                    </div>
                  ))}

                {!loadingDataProducts &&
                  dataProducts.data.map(
                    (item: RealEstateAssetView, index: number) => (
                      <div key={item._id} className="col-xl-3 col-6 px-2 m-0">
                        <ProductItem
                          asset={item}
                          className="col-xl-4 col-6 px-2 m-0 pb-4"
                          // border
                        />
                      </div>
                    )
                  )}

                {dataProducts.paginate.total > 0 && (
                  <div className="d-flex justify-content-end mt-3 align-items-center mb-3">
                    <Pagination
                      current={dataProducts.paginate.page}
                      total={
                        dataProducts.paginate.total *
                        dataProducts.paginate.limit
                      }
                      pageSize={dataProducts.paginate.limit}
                      onChange={(page, pageSize) => {
                        dispatch(
                          assetActions.getDataProducts({
                            page,
                            limit: dataProducts.paginate.limit,
                            filterObj: filterOptions,
                            search: (router.query.search as string) || "",
                          })
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-xl-3 col-12 mt-0 d-none">
              <div
                className="row"
                style={{
                  position: "sticky",
                  top: 10,
                  overflowY: "auto",
                  maxHeight: "calc(100vh)",
                }}
              >
                {/* Filter project owner */}
                <FilterProjectOwner />

                {/* Form of Asset */}
                <div className="col-12  d-none d-xl-block">
                  <TypeAssetFilter
                    filterOptions={filterOptions}
                    onChangeFilter={onChangeFilterForm}
                    listForm={listFormRealEstateAsset}
                    values={formTypeAssetFilter}
                    onChange={setFormTypeAssetFilter}
                  />
                </div>

                {/* Area Range */}
                <div className="col-12 mt-3">
                  <div className="price_rage h-100">
                    <label
                      style={{
                        marginBottom: "0px",
                        color: "#505050",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                      htmlFor="customRange2"
                      className="form-label p-2"
                    >
                      {trans[locate].area_range}
                    </label>
                    <div className="p-2 pt-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <InputNumber
                          min={0}
                          defaultValue={0}
                          value={filterOptions.rangeArea.min || 0}
                          onChange={(value) => {
                            onChangeFilterRangeArea("min", value);
                          }}
                        />
                        <span>
                          <i className="fa-solid fa-right-long"></i>
                        </span>
                        <InputNumber
                          min={0}
                          defaultValue={0}
                          value={filterOptions.rangeArea.max || 0}
                          onChange={(value) => {
                            onChangeFilterRangeArea("max", value);
                          }}
                        />
                      </div>
                      <div>
                        <List
                          style={{
                            padding: "0 0.5rem",
                            marginTop: 10,
                          }}
                          dataSource={[
                            {
                              min: 0,
                              max: 50,
                            },
                            {
                              min: 50,
                              max: 200,
                            },
                            {
                              min: 200,
                              max: 350,
                            },
                            {
                              min: 350,
                              max: 500,
                            },
                            {
                              min: 500,
                              max: 1000,
                            },
                          ]}
                          renderItem={(item) => (
                            <List.Item
                              onClick={() => {
                                onChangeFilterRangeArea("min", item.min);
                                onChangeFilterRangeArea("max", item.max);
                              }}
                              style={{
                                margin: 0,
                                padding: "5px 0",
                                cursor: "pointer",
                              }}
                            >
                              {item.min}㎡ - {item.max}㎡
                            </List.Item>
                          )}
                        />
                      </div>
                      <div>
                        <Button
                          onClick={() => {
                            dispatch(
                              assetActions.getDataProducts({
                                page: 1,
                                limit: dataProducts.paginate.limit,
                                filterObj: filterOptions,
                                search: (router.query.search as string) || "",
                              })
                            );
                          }}
                          block
                        >
                          {trans[locate].confirm}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="pb-5">
            </div> */}
      </PageLayout>
    );
}