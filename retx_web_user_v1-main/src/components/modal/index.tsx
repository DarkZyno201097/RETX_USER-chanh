import { Modal } from 'antd';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';

interface IProps {
    visible: boolean;
    onCancel: () => void;
    children: ReactNode;
    bodyStyle?: CSSProperties;
    width?: number;
}

export default function ModalBase({ visible, onCancel, children, bodyStyle, width }: IProps) {

    return (
        <>
            <Modal
                bodyStyle={{ padding: 0, backgroundColor: '#0000', ...bodyStyle }}
                title={null}
                visible={visible}
                footer={null}
                closable={false}
                onCancel={onCancel}
                width={width?width:800}
                modalRender={(modal) => (
                    <div className="w-100">
                        {modal}
                    </div>
                )}
            >
                {children}
            </Modal>
            <style jsx global>{`
                .ant-modal-content{
                    background-color: #0000;
                }
               
            `}</style>
        </>
    )
}