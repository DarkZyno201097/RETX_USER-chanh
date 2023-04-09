import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { humanActions } from '@store/actions'
import { humanSelector } from '@store/human/human.slice'

const DynamicSliderHuman = dynamic(
    () => import('@components/slider/slider_human'),
    { ssr: false }
)

interface IProps{
    title: string;
    type: 'team' | 'partner' | 'advisor'
}

export default function HumanContainer({title, type}: IProps) {
    const dispatch = useDispatch()
    const {
        humans
    } = useSelector(humanSelector)
    useEffect(()=>{
        dispatch(humanActions.getHumans(type))
    }, [])

    if (humans[type].length > 0)
    return (
        <>
            <section>
                <div className="container">
                    {type !== 'partner' && (
                        <h3 className="section__title--border-bottom">{
                            title
                        }</h3>
                    )}
                    <div style={{margin: '3rem 0'}}>
                        <DynamicSliderHuman type={type} />
                    </div>
                </div>
            </section>
        </>
    )
    else return <></>
}