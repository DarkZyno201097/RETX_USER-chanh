import { CSSProperties, ReactNode } from "react";
import { CircleSpinner } from "react-spinners-kit";


interface IProps {
    type: 'next' | 'later';
    title: string;
    onClick?: () => void;
    style?: CSSProperties;
    loading?: boolean;
    icon?: ReactNode
}

export default function RegBtnSubmit({
    type,
    title,
    onClick,
    style,
    loading,
    icon
}: IProps) {

    if (loading) return(
        <button style={style} type="submit" disabled className={`button btn-auth--submit d-flex align-items-center justify-content-center ${type}`}>
            <span style={{color: "#0000", width: 0}}>t</span> <CircleSpinner size={25} color="#fff" />
        </button>
    )

    return (
        <button style={{...style, ...icon && {paddingLeft: 40 }}} type="submit" onClick={onClick} className={`button btn-auth--submit ${type}`}>
            {icon} {title}
        </button>
    )
}