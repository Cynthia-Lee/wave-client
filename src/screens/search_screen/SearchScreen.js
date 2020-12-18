import React, { useState } from 'react';
import { Layout } from "antd";
import { gql, useQuery } from '@apollo/client';
import Fuse from 'fuse.js';

import Sidebar from "../../components/sidebar/Sidebar";
import SearchBar from "../../components/search_bar/SearchBar";
import ContentRow from "../../components/content_row/ContentRow";

import youtube from '../../api/youtube';

import "./SearchScreen.css";

const { Header, Content, Sider } = Layout;

function SearchScreen() {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const [seeSongs, setSeeSongs] = useState(false);
    const [seePlaylists, setSeePlaylists] = useState(false);
    const [seeUsers, setSeeUsers] = useState(false);
    const [seeSearch, setSeeSearch] = useState(false);

    const [playlists, setPlaylists] = useState([]);
    const { loading, error, data = {} } = useQuery(FETCH_PLAYLISTS_QUERY);
    const thesePlaylists = data.getPlaylists;

    const [users, setUsers] = useState([]);
    const { loading: loadingUsers, error: errorUsers, data: dataUsers = {} } = useQuery(FETCH_USERS_QUERY);
    const theseUsers = dataUsers.getUsers;

    async function handleSubmit(searchTerm) {
        // songs results (youtube)
        const { data: { items: videos } } = await youtube.get('/search', {
            params: {
                part: "snippet", // returns videos
                maxResults: 50, // # of videos fetched [0-50]
                key: "AIzaSyBAWxhQXBUqEIZ6Va60EAYzvhlRrRKOkWk",//process.env.YOUTUBE_API_KEY,
                q: searchTerm,
                type: "video",
                videoCategoryId: "10",
            }
        });
        setVideos(videos);
        setSelectedVideo(videos[0]);

        // playlist results (user's playlist, our data)
        setPlaylists(searchPlaylists(searchTerm));
        // user results (our data)
        setUsers(searchUsers(searchTerm));

        setSeeSearch(true);
    }

    function handleSongSeeAll() {
        setSeeSongs(!seeSongs);
    }

    function handlePlaylistSeeAll() {
        setSeePlaylists(!seePlaylists);
    }

    function handleUserSeeAll() {
        setSeeUsers(!seeUsers);
    }

    function searchPlaylists(searchTerm) {
        let publicPlaylists = thesePlaylists.filter(playlist => !playlist.isPrivate);
        const options = {
            includeScore: true,
            keys: ['name'] // keys:['name', 'songs.title']
        }
        const fuse = new Fuse(publicPlaylists, options);
        const fuseSearch = fuse.search(searchTerm); // closer to 0 = more match
        // console.log(fuseSearch);
        let resultPlaylists = [];
        for (var i = 0; i < fuseSearch.length; i++) {
            let playlist = fuseSearch[i].item;
            resultPlaylists.push(playlist);
        }
        return resultPlaylists;
    }

    function searchUsers(searchTerm) {
        const options = {
            includeScore: true,
            keys: ['username']
        }
        const fuse = new Fuse(theseUsers, options);
        const fuseSearch = fuse.search(searchTerm); // closer to 0 = more match
        console.log(fuseSearch);
        let resultUsers = [];
        for (var i = 0; i < fuseSearch.length; i++) {
            let user = fuseSearch[i].item;
            resultUsers.push(user);
        }
        return resultUsers;
    }

    if (loading || loadingUsers) {
        return (<Layout>
            <Sider><Sidebar active={"search"}></Sidebar></Sider>

            <Layout>
                <Header style={{ zIndex: 1, width: "100%" }}>
                    <SearchBar></SearchBar>
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
                <Sider><Sidebar active={"search"}></Sidebar></Sider>

                <Layout>

                    <Header style={{ zIndex: 1, width: "100%" }}>
                        <SearchBar onSubmit={handleSubmit}></SearchBar>
                    </Header>

                    <Content className="content">
                        {seeSearch ?
                            <>
                                <span>Songs</span>
                                <span className="see-all" onClick={handleSongSeeAll}>{seeSongs ? "SHOW LESS" : "SEE ALL"}</span>
                                <hr></hr>
                                {seeSongs ? <ContentRow type="song" videos={videos}></ContentRow>
                                    : <ContentRow type="song" videos={videos.slice(0, 4)}></ContentRow>}

                                <span>Playlists</span>
                                <span className="see-all" onClick={handlePlaylistSeeAll}>{seePlaylists ? "SHOW LESS" : "SEE ALL"}</span>
                                <hr></hr>
                                {seePlaylists ? <ContentRow type="playlist" playlists={playlists}></ContentRow>
                                    : <ContentRow type="playlist" playlists={playlists.slice(0, 4)}></ContentRow>}
                                <span>Users</span>
                                <span className="see-all" onClick={handleUserSeeAll}>{seeUsers ? "SHOW LESS" : "SEE ALL"}</span>
                                <hr></hr>
                                {seeUsers ? <ContentRow type="user" users={users}></ContentRow>
                                    : <ContentRow type="user" users={users.slice(0, 4)}></ContentRow>}
                            </>
                            : <></>}

                    </Content>
                </Layout>
            </Layout>
        );
    }
}

const FETCH_PLAYLISTS_QUERY = gql`
  query {
    getPlaylists{
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

const FETCH_USERS_QUERY = gql`
    query {
        getUsers {
            id
            email
            username
        }
    }
`;

export default SearchScreen;