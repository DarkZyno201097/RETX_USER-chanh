import { CircleSpinner } from "react-spinners-kit";
import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useEffect, useState } from "react";
import { alertActions, authActions } from "@store/actions";
import cookie from 'react-cookies'

import { contactApi } from "@apis/index";
import PageLayout from "@layouts/page";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { Contact } from "src/models/response/contact.model";
import { trans } from "src/resources/trans";



const dataContact = {
    hotline: {
        icon: <i className="fa-solid fa-phone"></i>,
        content: (value: string) => (
            <div>
                <a className="d-block a-none" href={`tel:${value}`}>{value}</a>
            </div>
        )
    },
    email: {
        icon: <i className="fa-regular fa-envelope"></i>,
        content: (value: string) => (
            <div>
                <a className="d-block a-none" href={`mailto:${value}`}>{value}</a>
            </div>
        )
    },
    address: {
        icon: <i className="fa-light fa-location-dot"></i>,
        content: (value: string) => (
            <div>
                <p className="m-0">
                    {value}
                </p>
            </div>
        )
    }
}

export default function ContactPage() {

    const dispatch = useDispatch()

    const { user, authenticated } = useSelector(authSelector)

    const [contact, setContact] = useState<Contact>(new Contact())
    const { locate } = useSelector(locateSelector)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [validateForm, setValidateForm] = useState({})

    useEffect(() => {
        (async () => {
            try {
                let response: any = await contactApi.getContact()
                setContact(new Contact(response.data as any))
            }
            catch (err) {
                console.log(err)
            }
        })()
    }, [])

    const sendMessage = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loadingSubmit == false) {
            setLoadingSubmit(true);

            setValidateForm({})
            try {
                let res = await contactApi.sendMessage({
                    name,
                    email,
                    message,
                })
                dispatch(alertActions.alertSuccess(trans[locate].send_success))
                if (!authenticated) {
                    setName('')
                    setEmail('')
                }

                setMessage('')
            }
            catch (err) {
                console.log(err)
                err?.errors && setValidateForm(err.errors)
                err?.message && dispatch(alertActions.alertError(err?.message))

            }
            setLoadingSubmit(false)
        }
    }

    useEffect(() => {
        let errors = { ...validateForm }
        delete errors['email']
        setValidateForm(errors)
    }, [email])
    useEffect(() => {
        let errors = { ...validateForm }
        delete errors['name']
        setValidateForm(errors)
    }, [name])
    useEffect(() => {
        let errors = { ...validateForm }
        delete errors['message']
        setValidateForm(errors)
    }, [message])

    useEffect(() => {
        if (authenticated) {
            user?.name && setName(user?.name)
            user.email && setEmail(user.email)
        }
    }, [authenticated])


    return (
        <PageLayout>

            <section className="contact-content">
                <div className="container">
                    <div className="contact-content__box" style={{ backgroundAttachment: '   ' }}>
                        <h3 className="contact__title">{trans[locate].header.contact}</h3>
                        <div className="contact-content__content">
                            <ul style={{ listStyle: 'none' }}>
                                {Object.keys(dataContact).map((key, index) => (
                                    <li className="d-flex align-items-center mt-3" key={index}>
                                        <span className="pe-3">{dataContact[key].icon}</span>
                                        <span>{dataContact[key].content(contact[key])}</span>
                                    </li>
                                ))}
                            </ul>

                        </div>
                    </div>
                </div>
            </section>

            <div className="section-space"></div>

            <section className="contact-message">
                <div className="container">
                    <h3 className="contact__title">
                        {trans[locate].send_us_a_message}
                    </h3>

                    <form onSubmit={sendMessage} autoComplete="off">
                        <div className="w-100" style={{ maxWidth: 600 }}>
                            <input
                                type="text"
                                value={name}
                                className={`contact__input ${validateForm['name'] && 'error'}`}
                                placeholder={trans[locate].fullname}
                                onChange={e => setName(e.target.value)}
                                disabled={authenticated && user?.name && true}
                            />
                            {validateForm['name'] && <h6 className="auth-page--input-message-error">{trans[locate][validateForm['name']]}</h6>}

                            <input
                                type="email"
                                value={email}
                                className={`contact__input mt-3 ${validateForm['email'] && 'error'}`}
                                placeholder="Email"
                                onChange={e => setEmail(e.target.value)}
                                disabled={authenticated && user.email && true}
                            />
                            {validateForm['email'] && <h6 className="auth-page--input-message-error">{trans[locate][validateForm['email']]}</h6>}

                            <textarea
                                name="message"
                                value={message}
                                className={`contact__input message mt-3 ${validateForm['message'] && 'error'}`}
                                placeholder={trans[locate].message}
                                onChange={e => setMessage(e.target.value)}
                            ></textarea>
                            {validateForm['message'] && <h6 className="auth-page--input-message-error">{trans[locate][validateForm['message']]}</h6>}


                            <button className="btn-primary-light mx-auto d-block mb-3 d-flex justify-content-center align-items-center">
                                {loadingSubmit ? (
                                    <CircleSpinner color="#fff" size={20} />
                                ) : (
                                    <span>{trans[locate].send}</span>
                                )}
                            </button>

                        </div>
                    </form>
                </div>

                <div className="contact--map d-flex justify-content-center align-items-center">
                    <div className="contact--map__content" dangerouslySetInnerHTML={{ __html: contact.mapEmbeded.replace(`width="600"`, `width="100%"`) }} />
                </div>
            </section>



        </PageLayout>
    )
}