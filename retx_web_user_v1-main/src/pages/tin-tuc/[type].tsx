import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import NewsContainer from "@components/containers/news_container";
import PageLayout from "@layouts/page";
import { trans } from "src/resources/trans";
import { locateSelector } from "@store/locate/locate.slice";


export default function NewsPage(){

    const router = useRouter();
    const {locate} = useSelector(locateSelector)
    const {type}=  router.query

    return (
        <PageLayout>

            {
                type == 'market' || type == 'company' ? (
                    <NewsContainer
                        title={
                            type == 'market' ? trans[locate].market_news : trans[locate].company_news
                        }
                        hideButton
                        type={type}
                        hiddenViewAll
                    />
                ) : (
                    ""
                )
            }

            <div className="section-space"></div>

        </PageLayout>
    )
}

