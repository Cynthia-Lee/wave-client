import React, { useContext, useState, useEffect } from 'react';
import { Layout, Button, Avatar, Row, Col, Input, Switch } from "antd";
import Sidebar from "./../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import CoverModal from "../../components/CoverModal";
import './SettingsScreen.css';
import { Create, NightsStay, Brightness5 } from "@material-ui/icons";
import { Typography, message } from 'antd';

import { AuthContext } from '../../context/auth';
import { gql, useQuery, useMutation } from '@apollo/client';

const { Header, Content, Sider } = Layout;
const { Paragraph, Text } = Typography;

function SettingsScreen(props) {
    const { user } = useContext(AuthContext);
    const [pictureLink, setPictureLink] = useState("");
    const [visible, setVisible] = useState(false);

    const [setPicture, { error: errorP }] = useMutation(SET_PICTURE_MUTATION, {
        variables: {
            picture: pictureLink
        },
    });

    const { loading: loadingUser, error: errorUser, data: dataUser = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = dataUser.getUser;

    useEffect(() => {
        if (thisUser) {
            setPictureLink(thisUser.picture);
        }
    }, [thisUser]);

    const onCreate = (values) => {
        // set image backend
        setPictureLink(values.coverurl);
        setVisible(false);
    };

    function setPictureCallback() {
        setPicture(pictureLink);
        success();
    }

    const success = () => {
        message.success('Saved changes successfully');
    };

    function cancelSettingsCallback() {
        props.history.goBack();
    }

    if (loadingUser) {
        return (<Layout>
            <Sider><Sidebar active={""}></Sidebar></Sider>

            <Layout>
                <Header style={{ zIndex: 1, width: "100%" }}>
                    <TopBar></TopBar>
                </Header>
                <Content className="content" >
                    <p>
                        Loading...
                    </p>
                </Content>
            </Layout>
        </Layout>);
    } else {

        return (
            <Layout>
                <Sider><Sidebar></Sidebar></Sider>

                <Layout>

                    <Header style={{ zIndex: 1, width: "100%" }}>
                        <TopBar></TopBar>
                    </Header>

                    <Content className="content">

                        <CoverModal
                            visible={visible}
                            onCreate={onCreate}
                            onCancel={() => {
                                setVisible(false);
                            }}
                            pictureModal={true}
                        />

                        <h1 className="settings-header">Settings</h1>
                        <h2 className="settings-subheader">Edit Profile</h2>
                        <hr></hr>
                        <h3 className="settings-sub-subheader">Profile Picture</h3>
                        <Avatar src={pictureLink} size={150} style={{ marginBottom: '1rem' }}></Avatar>
                        <Button size='medium' icon={<Create className="button-icon" fontSize="small" />} className="item" onClick={() => setVisible(true)}>Update</Button>

                        <h2 className="settings-subheader">Account</h2>
                        <hr></hr>
                        <h3 className="settings-sub-subheader">Username</h3>
                        <div>{user.username}</div>
                        <h3 className="settings-sub-subheader">Email</h3>
                        <div>{user.email}</div>

                        <hr className="footer-divider"></hr>
                        <span>
                            <Button type="primary" size="large" id="save-button" onClick={setPictureCallback}>SAVE SETTINGS</Button>
                            <Button type="ghost" size="large" id="cancel-button" onClick={cancelSettingsCallback}>CANCEL</Button>
                        </span>

                    </Content>

                </Layout>
            </Layout>
        );
    }
}
/*
<h3>Theme</h3>
<span className="theme"><Switch checkedChildren={<NightsStay className="theme-icon" fontSize="small" />} unCheckedChildren={<Brightness5 className="theme-icon" fontSize="small" />}></Switch></span>
*/
const FETCH_USER_QUERY = gql`
  query($username: String!) {
    getUser(username: $username) {
        id
        email
        username
        picture
        volume
        likedSongs
        likedPlaylists
	}
  }
`;

const SET_PICTURE_MUTATION = gql` 
    mutation($picture: String!) {
        setPicture(picture: $picture) {
            id
            email
            username
            picture
            volume
            likedSongs
            likedPlaylists
        }
    }
`;

export default SettingsScreen;