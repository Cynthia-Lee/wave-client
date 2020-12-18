import React, { useState, useEffect, useContext } from 'react';
import { Layout, Avatar, Button, Row, Col, Menu, Dropdown, Image, Modal, Tooltip } from "antd";
import Sidebar from "../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import SongRowCard from "../../components/song_row_card/SongRowCard";
import Widget from "../../components/widget/Widget";
import './PlaylistInfoScreen.css';
import { Favorite, FavoriteBorder, MoreHoriz, PlayArrow, Pause, AccessTime, Create, Lock } from '@material-ui/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { AuthContext } from '../../context/auth';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Link, useParams, withRouter } from 'react-router-dom';

import ShareModal from '../../components/ShareModal';
import ErrorPage from '../../components/error_page/ErrorPage';
import UnauthorizedPage from '../../components/error_page/UnauthorizedPage';
import { GlobalContext } from "../../GlobalState";

const { confirm } = Modal;

const { Header, Content, Sider, Footer } = Layout;

function PlaylistInfoScreen(props) {

    const [{ playing, currentSong, context, currentPlaylist }, dispatch] = useContext(GlobalContext);

    const setCurrentSong = data => {
        dispatch({ type: "setCurrentSong", snippet: data });
    };

    const setPlaying = data => {
        dispatch({ type: "setPlaying", snippet: data });
    };

    const setCurrentPlaylist = data => {
        dispatch({ type: "setCurrentPlaylist", snippet: data });
    }

    const { user } = useContext(AuthContext);
    const [visible, setVisible] = useState(false);
    // const [seeDeleteModal, setSeeDeleteModal] = useState(false);
    const pid = props.match.params.playlistId;

    const [isFavorite, setFavorite] = useState(false);

    const { loading: loadingU, error: errorU, data: dataU = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = dataU.getUser;

    useEffect(() => {
        if (thisUser) {
            setFavorite(checkFavorite());
        }
    }, [thisUser]);

    function checkFavorite() {
        var index = thisUser.likedPlaylists.indexOf(pid);
        // console.log(index);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likePlaylist, { error: errorL }] = useMutation(LIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: pid
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    const [unlikePlaylist, { error: errorUL }] = useMutation(UNLIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: pid
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    function toggleFavorite(isFavorite, e) {
        e.stopPropagation();
        if (isFavorite) {
            // un favorite
            unlikePlaylist();
        } else {
            // re favorite
            likePlaylist();
        }
    }

    const [deletePlaylist, { delError }] = useMutation(DELETE_PLAYLIST_MUTATION, {
        variables: { playlistId: pid },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }],
        update() {
            props.history.push('/library');
        }
    });

    function deletePlaylistCallback() {
        console.log("deleting");
        deletePlaylist();
    }

    function showDeleteModal(e) {
        e.domEvent.stopPropagation();
        showConfirm();
        // setSeeDeleteModal(true);
    }

    function handleConfirm() {
        // e.stopPropagation();
        deletePlaylistCallback();
        // setSeeDeleteModal(false);
    }

    /*
    function handleCancel(e) {
        // e.stopPropagation();
        // setSeeDeleteModal(false);
    }
    */

    function showConfirm() {
        confirm({
            title: 'Are you sure you want to delete this playlist?',
            icon: <ExclamationCircleOutlined />,
            okButtonProps: { style: { color: "black" } },
            content: 'This action cannot be undone.',
            onOk() {
                console.log('OK');
                handleConfirm();
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    // console.log(pid);
    const { loading, error, data = {} } = useQuery(FETCH_PLAYLIST_QUERY, {
        variables: {
            playlistId: pid
        },
    });
    const thisPlaylist = data.getPlaylist;

    // COPY PLAYLIST FUNCTIONS
    const [copyPlaylist, { error: copyError }] = useMutation(COPY_PLAYLIST_MUTATION, {
        variables: !thisPlaylist ? {} : {
            name: thisPlaylist.name + ' (Copy)',
            cover: thisPlaylist.cover,
            isPrivate: true,
            songs: setSongs(thisPlaylist.songs),
            totalTime: thisPlaylist.totalTime
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }],
        update(_, result) {

            // send to edit screen of selected playlist
            props.history.push('/edit/' + result.data.copyPlaylist.id);
        }
    });

    function setSongs(tempPlaylistSongs) {
        if (!tempPlaylistSongs) {
            return;
        }
        let result = [];
        for (var i = 0; i < tempPlaylistSongs.length; i++) {
            let song = tempPlaylistSongs[i];
            result.push({
                id: song.id,
                videoId: song.videoId,
                title: song.title,
                channelTitle: song.channelTitle,
                thumbnail: song.thumbnail,
                duration: song.duration,
                colors: song.colors
            });
        }
        return result;
    }

    function copyPlaylistCallback(e) {
        e.domEvent.stopPropagation();
        copyPlaylist();
    }

    if (loading) {
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

        if (thisPlaylist == undefined) {
            return <ErrorPage />;
        }

        const {
            id,
            name,
            creator,
            cover,
            isPrivate,
            totalTime,
            totalLikes,
            songs,
        } = thisPlaylist;

        if (thisPlaylist.isPrivate && thisPlaylist.creator != user.username) {
            return <UnauthorizedPage />;
        }

        function showShareModal(e) {
            e.domEvent.stopPropagation();
            setVisible(true);
        }

        let menu = (
            <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
                {thisPlaylist.creator == user.username ? <><Menu.Item><Link to={"/edit/" + thisPlaylist.id}>Edit</Link></Menu.Item><Menu.Item onClick={showDeleteModal}>Delete</Menu.Item></> : <></>}
                <Menu.Item onClick={(e) => copyPlaylistCallback(e)}>Copy Playlist</Menu.Item>
                {thisPlaylist.isPrivate ? <></> : <Menu.Item onClick={(e) => showShareModal(e)}>Share Playlist</Menu.Item>}
            </Menu>
        );

        function playPlaylist() {
            if (currentPlaylist != thisPlaylist.id) {
                setCurrentPlaylist(thisPlaylist.id);
                setCurrentSong(thisPlaylist.songs[0]);
                setPlaying(false);
            } else {
                context.resume();
                setPlaying(true);
            }

        }

        function pauseSong() {
            context.suspend();
            setPlaying(false);
        }

        return (
            <>
                <ShareModal
                    visible={visible}
                    playlist={thisPlaylist}
                    onCancel={() => {
                        setVisible(false);
                    }}
                >
                </ShareModal>
                <Layout>
                    <Sider><Sidebar active={""}></Sidebar></Sider>

                    <Layout>

                        <Header style={{ zIndex: 1, width: "100%" }}>
                            <TopBar></TopBar>
                        </Header>

                        <Content className="content" >

                            <Row wrap={false}>
                                <Col flex="none">
                                    <Avatar size={200} shape="square" src={thisPlaylist.cover}></Avatar>
                                </Col>
                                <Col flex="auto" className="playlist-margin-left">
                                    <Row flex="auto">
                                        <ul>
                                            {thisPlaylist.creator == user.username && thisPlaylist.isPrivate ? <li className="playlist-margin-top-icon"><Lock className="lock"></Lock></li> : <div className="playlist-margin-top"></div>}
                                            <Tooltip placement="top" title={<div dangerouslySetInnerHTML={{ __html: thisPlaylist.name }}></div>}>
                                                <li className="playlist-name"><div className="elip" dangerouslySetInnerHTML={{ __html: thisPlaylist.name }}></div></li>
                                            </Tooltip>
                                            <li className="artist-name playlist-data"><div className="elip"><Link to={"/profile/" + thisPlaylist.creator}>{thisPlaylist.creator}</Link>
                                                {thisPlaylist.songs.length != 0 ? <div className="info-less-bold"> • {thisPlaylist.songs.length} {thisPlaylist.songs.length == 1 ? "song" : "songs"}, {secondsToHms(thisPlaylist.totalTime)}</div> : <></>} </div></li>
                                        </ul>
                                    </Row>
                                </Col>
                            </Row>

                            <div className="large-song-controls">
                                <Row align="middle">
                                    {thisPlaylist.songs.length == 0 ?
                                        <Button className="play-button" disabled type="primary" shape="circle" icon={<PlayArrow className="play-arrow" size="large" />}></Button>
                                        :
                                        <Button className="play-button" type="primary" shape="circle" icon={playing && currentPlaylist == thisPlaylist.id ? <Pause onClick={() => pauseSong()} className="play-arrow" size="large" /> : <PlayArrow onClick={() => playPlaylist()} className="play-arrow" size="large" />}></Button>
                                    }

                                    {!thisPlaylist.isPrivate ? isFavorite ? <Favorite className="favorite-button heart" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite> : <FavoriteBorder className="favorite-button heart" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder> : <></>}
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

                            {thisPlaylist.songs.map((song, index) => (
                                <SongRowCard index={index} id={song.id} videoId={song.videoId} playlistId={thisPlaylist.id} title={song.title} channelTitle={song.channelTitle} thumbnail={song.thumbnail} duration={song.duration} colors={song.colors} history={props.history}></SongRowCard>
                            ))}

                        </Content>
                    </Layout>
                </Layout>
            </>
        );
    }
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (" hr ") : "";
    var mDisplay = m > 0 ? m + (" min ") : "";
    var sDisplay = s > 0 ? s + (" sec") : "";
    return hDisplay + mDisplay + sDisplay;
}

const DELETE_PLAYLIST_MUTATION = gql`
    mutation deletePlaylist($playlistId: ID!) {
        deletePlaylist(playlistId: $playlistId)
    }
`;

const FETCH_PLAYLIST_QUERY = gql`
  query($playlistId: ID!) {
    getPlaylist(playlistId: $playlistId) {
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

const COPY_PLAYLIST_MUTATION = gql`
    mutation copyPlaylist($name: String!, $cover: String!, $isPrivate: Boolean!, $songs: [SongInput], $totalTime: Int!) {
        copyPlaylist(name: $name, cover: $cover, isPrivate: $isPrivate, songs: $songs, totalTime: $totalTime) {
            id name creator cover isPrivate totalTime
            songs {
                id
                videoId
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

const LIKE_PLAYLIST_MUTATION = gql`
    mutation likePlaylist($playlistId: ID!) {
        likePlaylist(playlistId: $playlistId) {
            id
            email
            username
            likedSongs
            likedPlaylists
        }
    }
`;

const UNLIKE_PLAYLIST_MUTATION = gql`
    mutation unlikePlaylist($playlistId: ID!) {
        unlikePlaylist(playlistId: $playlistId) {
            id
            email
            username
            likedSongs
            likedPlaylists
        }
    }
`;

export default withRouter(PlaylistInfoScreen);