import React, { useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Result, Button, Layout } from 'antd';
import './ErrorPage.css';
import { Lock } from '@material-ui/icons';

import Sidebar from '../sidebar/Sidebar';
import TopBar from '../top_bar/TopBar';

const { Sider, Header, Content } = Layout;

function UnauthorizedPage(props) {

    return (
        <Layout>
            <Sider><Sidebar active={""}></Sidebar></Sider>

            <Layout>
                <Header style={{ zIndex: 1, width: "100%" }}>
                    <TopBar></TopBar>
                </Header>
                <Content className="content" >
                    <Result
                        icon={<Lock className="unauth-lock" />}
                        title="Unauthorized Access"
                        subTitle="Sorry, you are not authorized to access this page."
                        extra={<Button type="primary" className="back-home-button"><Link to="/library">Back Home</Link></Button>}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}

export default withRouter(UnauthorizedPage);
