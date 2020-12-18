import React from 'react';
import { Layout, Row, Col } from "antd";
import Sidebar from "../components/sidebar/Sidebar";
import TopBar from "../components/top_bar/TopBar";
import { AccessTime } from "@material-ui/icons"

/*import user from "./../dummy_data/user.json";
import playlist from "./../dummy_data/playlist.json";*/

const { Header, Content, Sider, Footer } = Layout;

export default class SongHistoryScreen extends React.Component {
    render() {
        return (
            <Layout>
                <Sider><Sidebar active={"songHistory"}></Sidebar></Sider>

                <Layout>

                    <Header style={{ zIndex: 1, width: "100%" }}>
                        <TopBar></TopBar>
                    </Header>

                    <Content className="content">
                        <h1 style={{ fontSize: "4rem" }}>History</h1>

                        <Row>
                            <Col span={1} className="header-divider number-label">#</Col>
                            <Col span={21} className="header-divider">TITLE</Col>
                            <Col span={2} className="center-icon time-icon"><AccessTime /></Col>
                        </Row>

                        <hr></hr>

                    </Content>
                </Layout>
            </Layout>
        );
    }
}
