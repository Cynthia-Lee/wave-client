import React, { useContext, useState } from 'react';
import { Layout } from "antd";
import Sidebar from "../components/sidebar/Sidebar";
import TopBar from "../components/top_bar/TopBar";
import ContentRow from "../components/content_row/ContentRow";

import { withRouter } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { gql, useQuery } from '@apollo/client';

const { Header, Content, Sider } = Layout;

function UserLibraryScreen(props) {
    const { user, logout } = useContext(AuthContext);
    const { loading, error, data = {} } = useQuery(FETCH_PLAYLISTS_QUERY);
    const thesePlaylists = data.getPlaylists;

    const [seePublic, setSeePublic] = useState(false);
    const [seePrivate, setSeePrivate] = useState(false);

    function handleSeePublic() {
        setSeePublic(!seePublic);
    }

    function handleSeePrivate() {
        setSeePrivate(!seePrivate);
    }

    if (loading) {
        return (<Layout>
            <Sider><Sidebar active={"yourPlaylists"}></Sidebar></Sider>

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
        //console.log(props.history);
        //console.log(thesePlaylists.filter(playlist => playlist.creator == user.username));
        let privatePlaylists = thesePlaylists.filter(playlist => playlist.creator == user.username && playlist.isPrivate);
        let publicPlaylists = thesePlaylists.filter(playlist => playlist.creator == user.username && !playlist.isPrivate);
        //console.log(ownedPlaylists);
        return (
            <Layout>
                <Sider><Sidebar active={"yourPlaylists"}></Sidebar></Sider>

                <Layout>

                    <Header style={{ zIndex: 1, width: "100%" }}>
                        <TopBar></TopBar>
                    </Header>

                    <Content className="content">
                        <span>Public</span>
                        <span className="see-all" style={{ float: 'right' }} onClick={handleSeePublic}>{seePublic ? "SHOW LESS" : "SEE ALL"}</span>
                        <hr></hr>
                        {seePublic ? <ContentRow type="playlist" heart="false" playlists={publicPlaylists} history={props.history}></ContentRow>
                            : <ContentRow type="playlist" heart="false" playlists={publicPlaylists.slice(0, 4)} history={props.history}></ContentRow>
                        }

                        <span>Private</span>
                        <span className="see-all" style={{ float: 'right' }} onClick={handleSeePrivate}>{seePrivate ? "SHOW LESS" : "SEE ALL"}</span>
                        <hr></hr>
                        {seePrivate ? <ContentRow type="playlist" heart="false" playlists={privatePlaylists} history={props.history}></ContentRow>
                            : <ContentRow type="playlist" heart="false" playlists={privatePlaylists.slice(0, 4)} history={props.history}></ContentRow>
                        }
                    </Content>

                </Layout>
            </Layout>
        );
    }
}

const FETCH_PLAYLISTS_QUERY = gql`
  query {
    getPlaylists {
      id 
      name 
      creator 
      cover 
      isPrivate 
      totalTime
      songs {
        id
        videoId
        title
        channelTitle
        thumbnail
        duration
        colors
      }
    }
  }
`;

export default withRouter(UserLibraryScreen);