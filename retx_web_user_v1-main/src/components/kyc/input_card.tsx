import { useState } from "react"


export default function KycInputCard() {

    const [editStatus, setEditStatus] = useState(false)

    return (
        <div className="d-flex">
            <input type="text" className="kyc--input-card" disabled={!editStatus} />
            <a onClick={() => setEditStatus(!editStatus)} role="button">
                <i className="fa-solid fa-pen"></i>
            </a>
        </div>
    )
}