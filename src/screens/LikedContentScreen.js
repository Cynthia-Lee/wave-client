import React, { useState, useEffect, useContext } from 'react';
import { Layout } from "antd";
import Sidebar from "../components/sidebar/Sidebar";
import TopBar from "../components/top_bar/TopBar";
import ContentRow from "../components/content_row/ContentRow";
import { gql, useQuery } from '@apollo/client';
import { AuthContext } from '../context/auth';

const { Header, Content, Sider } = Layout;

function LikedContentScreen(props) {
    const { user } = useContext(AuthContext);
    const [likedSongs, setLikedSongs] = useState([]);
    const [likedPlaylists, setLikedPlaylists] = useState([]);
    const [seeSongs, setSeeSongs] = useState(false);
    const [seePlaylists, setSeePlaylists] = useState(false);

    // USER LIKE FUNCTIONS
    const { loading, error: errorU, data = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = data.getUser;

    useEffect(() => {
        if (thisUser) {
            setLikedSongs(thisUser.likedSongs);
            setLikedPlaylists(thisUser.likedPlaylists);
        }
    }, [thisUser]);

    // 
    function handleSeeSongs() {
        setSeeSongs(!seeSongs);
    }

    function handleSeePlaylists() {
        setSeePlaylists(!seePlaylists);
    }

    return (
        <Layout>
            <Sider><Sidebar active={"likedContent"}></Sidebar></Sider>

            <Layout>

                <Header style={{ zIndex: 1, width: "100%" }}>
                    <TopBar></TopBar>
                </Header>

                <Content className="content">
                    <span>Playlists</span>
                    <span className="see-all" style={{ float: 'right' }} onClick={handleSeePlaylists}>{seePlaylists ? "SHOW LESS" : "SEE ALL"}</span>
                    <hr></hr>
                    {seePlaylists ? <ContentRow type="likedPlaylist" playlistIds={likedPlaylists} usernameLink={user.username}></ContentRow>
                        : <ContentRow type="likedPlaylist" playlistIds={likedPlaylists.slice(0, 4)} usernameLink={user.username}></ContentRow>}

                    <span>Songs</span>
                    <span className="see-all" style={{ float: 'right' }} onClick={handleSeeSongs}>{seeSongs ? "SHOW LESS" : "SEE ALL"}</span>
                    <hr></hr>
                    {seeSongs ? <ContentRow type="likedSong" videoIds={likedSongs}></ContentRow>
                        : <ContentRow type="likedSong" videoIds={likedSongs.slice(0, 4)}></ContentRow>}

                </Content>
                
            </Layout>
        </Layout>
    );
}

const FETCH_USER_QUERY = gql`
    query getUser($username: String!) {
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

export default LikedContentScreen;

// <Footer><Widget></Widget></Footer>