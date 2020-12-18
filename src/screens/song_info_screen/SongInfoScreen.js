import React, { useState, useEffect, useContext } from 'react';
import { Layout, Button, Row, Col, Image, Menu, Dropdown, Avatar, Form, Tooltip, message } from "antd";
import Sidebar from "../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import SongRowCard from "../../components/song_row_card/SongRowCard";
import Widget from "../../components/widget/Widget";
import './SongInfoScreen.css';
import { Favorite, FavoriteBorder, MoreHoriz, PlayArrow, Pause, AccessTime } from '@material-ui/icons';
import SongModal from "../../components/SongModal";
import SongCard from "../../components/content_card/SongCard";
import ErrorPage from '../../components/error_page/ErrorPage';
import { gql, useQuery, useMutation } from '@apollo/client';
import { AuthContext } from '../../context/auth';

import { useParams } from 'react-router-dom';
import youtube from '../../api/youtube';
import { GlobalContext } from "../../GlobalState";

const { Header, Content, Sider, Footer } = Layout;

function SongInfoScreen() {
    const { user } = useContext(AuthContext);

    const [{ playing, currentSong, context }, dispatch] = useContext(GlobalContext);

    const setCurrentSong = data => {
        dispatch({ type: "setCurrentSong", snippet: data });
    };

    const setPlaying = data => {
        dispatch({ type: "setPlaying", snippet: data });
    };

    const setCurrentPlaylist = data => {
        dispatch({ type: "setCurrentPlaylist", snippet: data });
    };

    function pauseSong() {
        context.suspend();
        setPlaying(false);
    }

    function resumeSong() {
        context.resume();
        setPlaying(true);
    }

    const { songId } = useParams();
    const [video, setVideo] = useState(null);
    const [isBusy, setBusy] = useState(true);
    const [videoDuration, setVideoDuration] = useState("");

    const [isFavorite, setFavorite] = useState(false);

    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    // const [videoId, setVideoId] = useState("");
    const [title, setTitle] = useState("");
    const [channelTitle, setChannelTitle] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    // COVER IMAGE MODAL CONTROLS
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);

    // ADD SONG FUNCTIONS
    useEffect(() => {
        youtube.get('/videos', {
            params: {
                part: "snippet,contentDetails", // returns videos
                key: "AIzaSyBAWxhQXBUqEIZ6Va60EAYzvhlRrRKOkWk",//process.env.YOUTUBE_API_KEY,
                id: songId,
            }
        }).then((res) => {
            setVideo(res.data.items[0]);
            // setVideoId(res.data.items[0].id);
            if (res.data.items[0]) {
                setTitle(res.data.items[0].snippet.title);
                setChannelTitle(res.data.items[0].snippet.channelTitle);
                setThumbnail(res.data.items[0].snippet.thumbnails.medium.url);
                setVideoDuration(res.data.items[0].contentDetails.duration);
            }
            setBusy(false);
        });
    }, []);

    const [addSong, { error }] = useMutation(ADD_SONG_MUTATION, {
        variables: {
            playlistId: selectedPlaylistId, videoId: songId, title: title, channelTitle: channelTitle, thumbnail: thumbnail,
            duration: videoDuration, colors: ["#00D4D9", "#00E2A9"]
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
    });

    function onCreate() {
        if (selectedPlaylistId) {
            addSong();
        } else {
            message.error('Song not added. No playlist was selected.');
        }
        setVisible(false);
    };

    // USER LIKE FUNCTIONS
    const { loading, error: errorU, data = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = data.getUser;

    useEffect(() => {
        if (thisUser) {
            setFavorite(checkFavorite());
        }
    }, [thisUser]);

    function checkFavorite() {
        var index = thisUser.likedSongs.indexOf(songId);
        // console.log(index);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likeSong, { error: errorL }] = useMutation(LIKE_SONG_MUTATION, {
        variables: {
            videoId: songId
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    const [unlikeSong, { error: errorUL }] = useMutation(UNLIKE_SONG_MUTATION, {
        variables: {
            videoId: songId
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    function toggleFavorite(isFavorite, e) {
        e.stopPropagation();
        if (isFavorite) {
            // un favorite
            unlikeSong();
        } else {
            // re favorite
            likeSong();
        }
    }

    function changeCurrentSong() {
        if (!currentSong || currentSong.videoId != songId || currentSong.id != null) {
            setCurrentSong({
                id: null,
                videoId: songId,
                title: title,
                channelTitle: channelTitle,
                thumbnail: thumbnail,
                duration: videoDuration,
                colors: ["#00D4D9", "#00E2A9"]
            });
            setPlaying(false);
        } else {
            resumeSong();
        }
        setCurrentPlaylist(null);
    }

    let menu = null;
    /*menu = (
        <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
            <Menu.Item onClick={e => addSongCallback(e)}>Add to playlist</Menu.Item>
        </Menu>
    );*/

    menu = (
        <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
            <Menu.Item onClick={() => { setVisible(true); }}>Add to playlist</Menu.Item>
        </Menu>
    );


    if (isBusy){
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
    }else if(!video) {
        return <ErrorPage />;
    } else {

        return (
            <>
                <SongModal
                    visible={visible}
                    onCreate={onCreate}
                    onCancel={() => {
                        setVisible(false);
                    }}
                    onChange={(value) => setSelectedPlaylistId(value)}
                />

                {isBusy ? <></> :
                    <Layout>
                        <Sider><Sidebar active={""}></Sidebar></Sider>

                        <Layout>

                            <Header style={{ zIndex: 1, width: "100%" }}>
                                <TopBar></TopBar>
                            </Header>

                            <Content className="content">

                                <Row wrap={false}>
                                    <Col flex="none">
                                        <Image className="thumbnail" /*width={200}*/ shape="square" src={video.snippet.thumbnails.medium.url}></Image>
                                    </Col>
                                    <Col flex="auto" className="playlist-margin-left">
                                        <Row flex="auto" className="playlist-margin-top">
                                            <ul>
                                                <Tooltip placement="top" title={<div dangerouslySetInnerHTML={{ __html: video.snippet.title }}></div>}>
                                                    <li className="song-name"><div className="elip" dangerouslySetInnerHTML={{ __html: video.snippet.title }}></div></li>
                                                </Tooltip>
                                                <li className="artist-name"><div dangerouslySetInnerHTML={{ __html: video.snippet.channelTitle }}></div></li>
                                            </ul>
                                        </Row>
                                    </Col>
                                </Row>

                                <div className="large-song-controls">
                                    <Row align="middle">
                                        <Button className="play-button" type="primary" shape="circle" icon={playing && currentSong.videoId == songId && currentSong.id == null ? <Pause className="play-arrow" size="large" onClick={() => { pauseSong() }} /> : <PlayArrow className="play-arrow" size="large" onClick={() => changeCurrentSong()} />}></Button>
                                        {isFavorite ? <Favorite className="favorite-button heart" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite> : <FavoriteBorder className="favorite-button heart" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder>}
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <a className="ant-dropdown-link no-spacing center-menu" onClick={e => e.preventDefault()}>
                                                <div className="user-menu">
                                                    <MoreHoriz className="menu-arrow large-icon"></MoreHoriz>
                                                </div>
                                            </a>
                                        </Dropdown>
                                    </Row>
                                </div>

                                <br></br>
                                <Row wrap={false}>
                                    <Col flex="none" className="header-divider number-label"><div style={{ minWidth: "2rem" }}>#</div></Col>
                                    <Col flex="auto" className="header-divider">TITLE</Col>
                                    <Col flex="none" className="center-icon time-icon"><AccessTime style={{ minWidth: "10rem" }} /></Col>
                                </Row>

                                <hr></hr>

                                <SongRowCard index={0} id={null} videoId={songId} title={video.snippet.title} channelTitle={video.snippet.channelTitle} thumbnail={video.snippet.thumbnails.medium.url} duration={video.contentDetails.duration} colors={["#00D4D9", "#00E2A9"]}></SongRowCard>

                            </Content>
                        </Layout>
                    </Layout>
                }

            </>
        );
    }
}
//}

const ADD_SONG_MUTATION = gql`
    mutation addSong($playlistId: ID!, $videoId: String!, $title: String!, $channelTitle: String!, $thumbnail: String!, $duration: String!) {
        addSong(playlistId: $playlistId, videoId: $videoId, title: $title, channelTitle: $channelTitle, thumbnail: $thumbnail, duration: $duration) {
            id
            songs {
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

const FETCH_PLAYLISTS_QUERY = gql`
  query {
    getPlaylists {
      id 
      name 
      creator 
      cover 
      isPrivate 
      songs {
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

const LIKE_SONG_MUTATION = gql`
    mutation likeSong($videoId: String!) {
        likeSong(videoId: $videoId) {
            id
            email
            username
            likedSongs
            likedPlaylists
        }
    }
`;

const UNLIKE_SONG_MUTATION = gql`
    mutation unlikeSong($videoId: String!) {
        unlikeSong(videoId: $videoId) {
            id
            email
            username
            likedSongs
            likedPlaylists
        }
    }
`;

export default SongInfoScreen;