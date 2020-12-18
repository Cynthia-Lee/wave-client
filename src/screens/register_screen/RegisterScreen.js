import React, { useContext, useState } from 'react';
import { Layout, Button, Form, Input } from "antd";
import Logo from "../../components/Logo";
import './RegisterScreen.css';
import { withRouter } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';

import { AuthContext } from '../../context/auth';

import { useForm } from '../../util/hooks';

const { Content } = Layout;

function RegisterScreen(props) {

    /*
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [addUser, { loading }] = useMutation(REGISTER_USER, {
        update(_, result) { // triggered if mutation is successfully executed
            console.log(result);
        },
        variables: {
            ...values
        }
    });

    const onFinish = (values) => {
        console.log(values);
        // this.props.history.push('/library');
        addUser();
    };
    */

    /*
    const [form] = Form.useForm();
    const onReset = () => {
        form.resetFields();
    };
    */

    const context = useContext(AuthContext);
    const [errors, setErrors] = useState({});

    const { onChange, onSubmit, values } = useForm(registerUser);

    // const [addUser, { loading }] = useMutation(REGISTER_USER, { errorPolicy: 'all' });
    const [addUser, { loading }] = useMutation(REGISTER_USER, {
        update(_, { data: { register: userData } }) { // triggered if mutation is successfully executed
            context.login(userData);
            props.history.push('/library');
        },
        onError(err) {
            console.log(err.graphQLErrors[0].extensions.exception.errors);
            setErrors(err.graphQLErrors[0].extensions.exception.errors);
        },
        variables: values,
    });

    function registerUser(values) {
        addUser({
            variables: {
                ...values,
            }
        });
    }

    /*
    const handleSubmit = async (values) => {
        addUser({
            variables: {
                ...values,
            }
        })
        try {
            
        } catch (e) {
            setErrors(e);
            //console.log(e.graphQLErrors[0].extensions.exception.errors)
            //setErrors(e.graphQLErrors[0].extensions.exception.errors);
        }
    }
    */

    const onFinish = values => {
        console.log(values);
        // handleSubmit(values);
        registerUser(values);
    };

    return (
        <Layout>
            <Content
                className="site-layout main">

                <div style={{ textAlign: "center", height: "3rem", width: "auto", margin: "4rem" }}>
                    <a href="/" >
                        <Logo style={{ height: "100%" }}></Logo>
                    </a>
                </div>

                <div
                    className="site-layout-background form-card">
                    <h1 className="title">Sign Up</h1>

                    <Form
                        name="register"
                        className="register-form"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}>
                        <Form.Item
                            name="username"
                            error={errors.username ? true : false}
                            label="Username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input a Username',
                                },
                            ]}>
                            <Input id="username" placeholder="Enter a username" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            error={errors.email ? true : false}
                            label="Email Address"
                            rules={[
                                {
                                    type: 'email',
                                    message: 'Please input a valid email'
                                },
                                {
                                    required: true,
                                    message: 'Please input an email',
                                },
                            ]}>
                            <Input id="email" placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            error={errors.password ? true : false}
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input a Password',
                                },
                            ]}>
                            <Input.Password id="password" placeholder="Create a password"></Input.Password>
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            error={errors.confirmPassword ? true : false}
                            onChange={onChange}
                            label="Re-type Password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input a Password',
                                },
                                ({ getFieldValue }) => ({
                                    validator(rule, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject('The two passwords that you entered do not match!');
                                    },
                                })
                            ]}>
                            <Input.Password id="confirm-password" placeholder="Confirm your password"></Input.Password>
                        </Form.Item>

                        {Object.keys(errors).length > 0 && (
                            <div className="">
                                <ul className="list">
                                    {Object.values(errors).map((value) => (
                                        <li className="err-msg" key={value}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="footer">
                            <Form.Item>
                                <Button type="primary" className="register-form-button login-button" htmlType="submit">
                                    Register
                                </Button>
                            </Form.Item>
                            <hr className="divider"></hr>
                            <div className="redirect">Already have an account? <a href='/login'>Log In</a></div>
                        </div>
                    </Form>

                </div>
            </Content>
        </Layout>
    );
}

const REGISTER_USER = gql`
    mutation register(
        $username: String!
        $email: String!
        $password: String!
        $confirmPassword: String!
    ) {
        register(
            registerInput: {
                username: $username
                email: $email
                password: $password
                confirmPassword: $confirmPassword
            }
        ){
            id email username token
        }
    }
`;

export default withRouter(RegisterScreen);