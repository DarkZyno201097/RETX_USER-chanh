import { useEffect, useState } from "react";
import moment from 'moment'
import { useSelector } from "react-redux";

import { CommentsQA, ICommentsQA } from "src/models/comment.model";
import { locateSelector } from "@store/locate/locate.slice";
import { trans } from "src/resources/trans";
import { Avatar } from "antd";
import Image from "next/image";

interface IProps {
    data: ICommentsQA,
    commentQA__create: (e: any, parentId?: string, content?: string, onReplySuccess?: () => void) => void
}

export default function FeedbackItem({
    data,
    commentQA__create
}: IProps) {

    const { locate } = useSelector(locateSelector)
    const [clickBtnReply, setClickBtnReply] = useState(false)
    const [content, setContent] = useState('')

    moment.locale(locate)


    // useEffect(() => {
    //     console.log()
    // }, [])

    return (
        <div key={data._id} className="feadback-item">
            <div className="d-flex ">
                <div style={{ marginRight: 10}}>
                    <img style={{borderRadius: '100%', width: 50, height: 50}} src={data?.userId?.avatarUrl || "https://via.placeholder.com/70x70"} alt="image" />
                </div>
                <div className="info">
                    <div className="name">
                        <span className="name-user">{data?.userId?.name}</span> <span className="time">{moment(data.createdAt).fromNow()}</span>
                    </div>
                    <p className="message m-0" style={{ whiteSpace: 'pre-line' }}>
                        {data.content}
                    </p>
                    <a role="button" onClick={() => setClickBtnReply(!clickBtnReply)} className="btn-reply">
                        {trans[locate].reply}
                    </a>
                </div>
            </div>

            {data?.parent?.map(item => (
                <div key={item._id} className="reply-content info">
                    <div className="name">
                        <span className="name-user">{item.userId?.name}</span> <span className="time">{moment(item.createdAt).fromNow()}</span>
                    </div>
                    <p className="message m-0">
                        {item.content}
                    </p>
                </div>
            ))}

            {clickBtnReply && (
                <div className="reply-content--input">
                    <form onSubmit={e => commentQA__create(e, data._id, content, () => setContent(''))} style={{ position: 'relative' }}>
                        <textarea onChange={e => setContent(e.target.value)} value={content} name="input-content" placeholder={trans[locate].write_question} className="input-content" style={{ width: '100%' }} rows={2}></textarea>
                        <button role="button" className="btn-primary-light btn-submit">
                            {trans[locate].submit_question}
                        </button>
                    </form>
                </div>
            )}

        </div>
    )
}