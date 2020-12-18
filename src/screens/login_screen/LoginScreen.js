import React, { useContext, useState } from 'react';
import { Layout, Button, Form, Input, Alert } from "antd";
import Logo from "../../components/Logo";
import './LoginScreen.css';
import { withRouter } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';

import { AuthContext } from '../../context/auth';
import { useForm } from '../../util/hooks';

const { Content } = Layout;

function LoginScreen(props) {
    const context = useContext(AuthContext);

    const { onChange, onSubmit, values } = useForm(loginUserCallback);

    // const [loginUser, { loading }] = useMutation(LOGIN_USER, { errorPolicy: 'all' });
    const [loginUser, { loading }] = useMutation(LOGIN_USER, {
        update(_, { data: { login: userData }}) { // triggered if mutation is successfully executed
            // console.log(userData);
            context.login(userData);
            props.history.push('/library');
        }, onError(err) {
            console.log(err.graphQLErrors[0].extensions.exception.errors);
            setErrors(err.graphQLErrors[0].extensions.exception.errors);
        },
        variables: values,
    });
    
    const [errors, setErrors ] = useState('');

    /*const handleSubmit = async (values) => {
        try {
            loginUser({
                variables: {
                    ...values,
                }
            })
        } catch (e) {
            setErrors(e);
        }
    }*/
    function loginUserCallback(values) {
        loginUser({
            variables: {
                ...values,
            }
        });
      }

    const onFinish = values => {
        console.log(values);
        loginUserCallback(values);
        //handleSubmit(values);
    };

    // render(){
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
                    <h1 className="title">Log In</h1>

                    <Form
                        name="login"
                        className="login-form"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}>
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Email',
                                },
                            ]}>
                            <Input id="email" placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Password',
                                },
                            ]}>
                            <Input.Password id="password" placeholder="Password"></Input.Password>
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
                                <Button type="primary" className="login-form-button login-button" htmlType="submit">
                                    Log In
                                </Button>
                            </Form.Item>
                            <hr className="divider"></hr>
                            <div className="redirect">Don't have an account? <a href='/register'>Register Now</a></div>
                        </div>

                    </Form>
                </div>

            </Content>

        </Layout>
    );
    // }
}

const LOGIN_USER = gql`
    mutation login(
        $email: String!
        $password: String!
    ) {
        login(
            email: $email
            password: $password
        ){
            id email username token
        }
    }
`;

export default withRouter(LoginScreen);