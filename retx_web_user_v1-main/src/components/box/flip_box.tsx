import { ReactNode, useRef, useState } from "react";

import useOutsideComponent from "@utils/use_outside_component";


interface IProps {
    width: string;
    height: string;
    frontComponent: ReactNode;
    backComponent: ReactNode;
}

export default function FlipBox({
    width,
    height,
    frontComponent,
    backComponent
}: IProps) {

    const [isFlipped, setIsFlipped] = useState(false)

    const onFlipped = () => {
        setIsFlipped(!isFlipped)
    }

    const ref = useRef()

    useOutsideComponent(ref, () => setIsFlipped(false))


    return (
        <a
            role={'button'}
            ref={ref}
            onClick={onFlipped}
            style={{ width, height, overflowY: 'auto' }}>
            {!isFlipped ? (
                <div>
                    <div style={{ width, height }} className="flip-front">
                        {frontComponent}
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ width, height, border: 0, backgroundColor: "#fff" }} className="flip-back">
                        {backComponent}
                    </div>
                </div>
            )}
        </a>
    )
}