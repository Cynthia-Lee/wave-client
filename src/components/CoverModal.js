import React from 'react';
import 'antd/dist/antd.css';
import { Modal, Form, Input } from 'antd';

const CoverModal = ({ visible, onCreate, onCancel, pictureModal }) => {
    const [form] = Form.useForm();
    return (
        <Modal
            visible={visible}
            title={pictureModal ? "Change Profile Picture" : "Change Playlist Cover Image"}
            okText="Insert"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
            okButtonProps={{ style: { color: "black" } }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
            >
                <Form.Item
                    name="coverurl"
                    rules={[
                        {
                            required: true,
                            message: 'Paste URL of image',
                        },
                    ]}
                >
                    <Input placeholder={"Paste URL of image..."} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CoverModal;