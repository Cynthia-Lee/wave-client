import React, { useContext, useState, useEffect } from 'react';
import { Layout, Avatar } from "antd";
import Sidebar from "../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import ContentRow from "../../components/content_row/ContentRow";
import './UserProfileScreen.css';

import { AuthContext } from '../../context/auth';
import { gql, useQuery } from '@apollo/client';

import ErrorPage from '../../components/error_page/ErrorPage';

//const { Header, Content, Sider, Footer } = Layout;
//const { user } = useContext(AuthContext);

function UserProfileScreen(props) {
    const { Header, Content, Sider } = Layout;
    const { user } = useContext(AuthContext);
    const [likedSongs, setLikedSongs] = useState([]);
    const [likedPlaylists, setLikedPlaylists] = useState([]);
    const [picture, setPicture] = useState("");
    const [seeSongs, setSeeSongs] = useState(false);
    const [seePlaylists, setSeePlaylists] = useState(false);

    const usernameLink = props.match.params.username; // for user mentioned in the link

    const { loading: loadingUser, error: errorUser, data: dataUser = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: usernameLink
        },
    });
    const thisUser = dataUser.getUser;
    // console.log(dataUser);

    useEffect(() => {
        if (thisUser) {
            setLikedSongs(thisUser.likedSongs);
            setLikedPlaylists(thisUser.likedPlaylists);
            setPicture(thisUser.picture);
        }
    }, [thisUser]);

    // 
    function handleSeeSongs() {
        setSeeSongs(!seeSongs);
    }

    function handleSeePlaylists() {
        setSeePlaylists(!seePlaylists);
    }

    const { loading, error, data = {} } = useQuery(FETCH_PLAYLISTS_QUERY);
    const thesePlaylists = data.getPlaylists;
    const [seePublic, setSeePublic] = useState(false);

    function handleSeePublic() {
        setSeePublic(!seePublic);
    }

    if (loading || loadingUser) {
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
        if (thisUser === undefined) {
            return <ErrorPage />;
        }
        let publicPlaylists = thesePlaylists.filter(playlist => playlist.creator === usernameLink && !playlist.isPrivate);

        return (
            <Layout>
                <Sider><Sidebar active={""}></Sidebar></Sider>

                <Layout>

                    <Header style={{ zIndex: 1, width: "100%" }}>
                        <TopBar></TopBar>
                    </Header>

                    <Content className="content">
                        <div className="user-info">
                            <Avatar size={200} src={picture}></Avatar>
                            <h1 className="username-title">{usernameLink}</h1>
                        </div>
                        <span>Public Playlists</span>
                        <span className="see-all" style={{ float: 'right' }} onClick={handleSeePublic}>{seePublic ? "SHOW LESS" : "SEE ALL"}</span>
                        <hr></hr>
                        {seePublic ? <ContentRow type="playlist" heart="false" playlists={publicPlaylists} history={props.history}></ContentRow>
                            : <ContentRow type="playlist" heart="false" playlists={publicPlaylists.slice(0, 4)} history={props.history}></ContentRow>
                        }

                        <span>Liked Playlists</span>
                        <span className="see-all" style={{ float: 'right' }} onClick={handleSeePlaylists}>{seePlaylists ? "SHOW LESS" : "SEE ALL"}</span>
                        <hr></hr>
                        {seePlaylists ? <ContentRow type="likedPlaylist" playlistIds={likedPlaylists} usernameLink={usernameLink}></ContentRow>
                            : <ContentRow type="likedPlaylist" playlistIds={likedPlaylists.slice(0, 4)} usernameLink={usernameLink}></ContentRow>}

                        <span>Liked Songs</span>
                        <span className="see-all" style={{ float: 'right' }} onClick={handleSeeSongs}>{seeSongs ? "SHOW LESS" : "SEE ALL"}</span>
                        <hr></hr>
                        {seeSongs ? <ContentRow type="likedSong" videoIds={likedSongs}></ContentRow>
                            : <ContentRow type="likedSong" videoIds={likedSongs.slice(0, 4)}></ContentRow>}

                    </Content>
                </Layout>
            </Layout>
        );
        //}
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

export default UserProfileScreen;