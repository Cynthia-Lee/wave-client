import React, { useContext, useState, useEffect } from 'react';
import { Layout, Avatar, Button, Row, Col, Switch, Menu, Dropdown, Input, Image, Modal, Form, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import Sidebar from "../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import SongRowCard from "../../components/song_row_card/SongRowCard";
import CoverModal from "../../components/CoverModal";
import './EditPlaylistScreen.css';
import { Favorite, FavoriteBorder, MoreHoriz, PlayArrow, Pause, AccessTime, Create, Save } from '@material-ui/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { AuthContext } from '../../context/auth';
import { gql, useQuery, useMutation } from '@apollo/client';
import { withRouter, Link } from 'react-router-dom';

import ShareModal from '../../components/ShareModal';
import ErrorPage from '../../components/error_page/ErrorPage';

import { GlobalContext } from "../../GlobalState";

const { confirm } = Modal;

const { Header, Content, Sider } = Layout;

function EditPlaylistScreen(props) {

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

    const setContext = data => {
        dispatch({ type: "setContext", snippet: data });
    };

    const setSource = data => {
        dispatch({ type: "setSource", snippet: data });
    };

    const { user } = useContext(AuthContext);

    const [playlistName, setPlaylistName] = useState('');
    const [playlistPrivate, setPlaylistPrivate] = useState(true);
    const [playlistCover, setPlaylistCover] = useState('');
    const [tempPlaylistSongs, setTempPlaylistSongs] = useState(null);
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
        if(currentPlaylist == pid){
            if (context.state != "closed") {
                context.close();
            }
            setCurrentSong(null);
            setContext(new AudioContext());
            setSource(null);
            setPlaying(false);
            setCurrentPlaylist(null);
        }
        
    }, []);

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

    // EDIT PLAYLIST SAVE/CANCEL CONTROLS
    function cancelEdit() {
        let path = '/playlist/' + pid;
        props.history.push(path);
    }

    const success = () => {
        message.success('Saved changes successfully');
    };

    const [editPlaylist, { setError }] = useMutation(EDIT_PLAYLIST_MUTATION, { // called by save button
        variables: {
            playlistId: pid,
            name: playlistName,
            isPrivate: playlistPrivate,
            cover: playlistCover,
            songs: setSongs(tempPlaylistSongs)
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }], //PLAYLIST
        update() {
            // console.log(tempPlaylistSongs);
            // console.log(result);
            cancelEdit();
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

    function editPlaylistCallback() {
        editPlaylist();
        success();
    }

    // DELETE PLAYLIST CONTROLS
    const [deletePlaylist, { delError }] = useMutation(DELETE_PLAYLIST_MUTATION, {
        variables: { playlistId: pid },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }],
        update() {
            props.history.push('/library');
        }
    });

    function showDeleteModal(e) {
        e.domEvent.stopPropagation();
        showConfirm();
        // setSeeDeleteModal(true);
    }

    function handleConfirm() {
        // e.stopPropagation();
        deletePlaylist();
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

    // COVER IMAGE MODAL CONTROLS
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [visibleSM, setVisibleSM] = useState(false);

    function showShareModal(e) {
        e.domEvent.stopPropagation();
        setVisibleSM(true);
    }

    const onCreate = (values) => {
        console.log('Received values of form: ', values);
        // set image backend
        setPlaylistCover(values.coverurl);
        setVisible(false);
    };

    const { loading, error, data = {} } = useQuery(FETCH_PLAYLIST_QUERY, {
        variables: {
            playlistId: pid
        },
    });
    const thisPlaylist = data.getPlaylist;

    useEffect(() => {
        if (thisPlaylist) {
            setPlaylistName(thisPlaylist.name);
            setPlaylistPrivate(thisPlaylist.isPrivate);
            setPlaylistCover(thisPlaylist.cover);
            setTempPlaylistSongs(thisPlaylist.songs);
        }
    }, [thisPlaylist]);

    // DRAGGABLE CONTROLS
    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list); // need to make a copy inorder to splice
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    function onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            tempPlaylistSongs,
            result.source.index,
            result.destination.index
        );
        /*
        this.setState({
            items
        });
        */
        setTempPlaylistSongs(items);
    }

    useEffect(()=>{
        console.log(tempPlaylistSongs);
    },[tempPlaylistSongs]);

    function setTempColors(index, colors) {
        // deep copy
        let items = JSON.parse(JSON.stringify(tempPlaylistSongs));
        items[index].colors = colors;
        setTempPlaylistSongs(items);
    }

    function deleteSong(index){
        let items = JSON.parse(JSON.stringify(tempPlaylistSongs));
        items.splice(index,1);
        setTempPlaylistSongs(items);
    }
    function addSong(song){
        setTempPlaylistSongs(tempPlaylistSongs.concat([song]));
    }

    // return rendering
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

        if (thisPlaylist.creator != user.username) {
            let path = '/playlist/' + pid;
            props.history.push(path);
        } else {

            let menu = (
                <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
                    {thisPlaylist.creator == user.username ? <><Menu.Item onClick={showDeleteModal}>Delete</Menu.Item></> : <></>}
                    {thisPlaylist.isPrivate ? <></> : <Menu.Item onClick={(e) => showShareModal(e)}>Share Playlist</Menu.Item>}
                </Menu>
            );

            return (
                <>
                    <ShareModal
                        visible={visibleSM}
                        playlist={thisPlaylist}
                        onCancel={() => {
                            setVisibleSM(false);
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

                                <CoverModal
                                    visible={visible}
                                    onCreate={onCreate}
                                    onCancel={() => {
                                        setVisible(false);
                                    }}
                                />

                                <Row wrap={false}>

                                    <Col>
                                        <Avatar size={200} shape="square" src={playlistCover}></Avatar>
                                        <Button className="change-image-button"
                                            onClick={() => {
                                                setVisible(true);
                                            }}
                                            className="upload-cover"
                                            size="small"
                                            icon={<UploadOutlined />}>
                                            Change Image
                                            </Button>
                                    </Col>

                                    <Col flex="auto">

                                        <Row className="edit-options" wrap={false}>

                                            <Col flex="300px">
                                                <span className="private-switch"><span id="private-label">Private</span><Switch defaultChecked={!thisPlaylist.isPrivate} onChange={event => setPlaylistPrivate(!playlistPrivate)}></Switch><span id="public-label">Public</span></span>
                                            </Col>

                                            <Col flex="auto">
                                                <Row justify="end" wrap={false}>
                                                    <Col>
                                                        <Button className="edit-save" onClick={editPlaylistCallback}><Save className="button-icon" />Save Changes</Button>
                                                    </Col>
                                                    <Col>
                                                        <Button className="edit-cancel" onClick={cancelEdit}>Cancel</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row className="edit-options" flex="auto">
                                            <ul>
                                                <li className="edit-margin-top"><Input onChange={event => setPlaylistName(event.target.value)} maxLength={50} defaultValue={thisPlaylist.name} id="playlist-name-input" suffix={<Create id="edit-playlist-name-icon"></Create>} ></Input></li>
                                                <li className="artist-name playlist-data"><div className="elip"><Link to={"/profile/" + thisPlaylist.creator}>{thisPlaylist.creator}</Link>
                                                    {thisPlaylist.songs.length != 0 ? <div className="info-less-bold"> • {thisPlaylist.songs.length} {thisPlaylist.songs.length == 1 ? "song" : "songs"}, {secondsToHms(thisPlaylist.totalTime)}</div> : <></>} </div></li>
                                            </ul>
                                        </Row>
                                    </Col>
                                </Row>

                                <div className="large-song-controls">
                                    <Row align="middle">
                                        <Button className="play-button" disabled type="primary" shape="circle" icon={<PlayArrow className="play-arrow" size="large" />}></Button>
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
                                <div id="edit-drag-drop">
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId={thisPlaylist.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                >
                                                    {tempPlaylistSongs ? tempPlaylistSongs.map((song, index) => ( // {thisPlaylist.songs.map((song, index) => (
                                                        <Draggable key={song.id} draggableId={song.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <SongRowCard index={index} id={song.id} videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} thumbnail={song.thumbnail} duration={song.duration} colors={song.colors} history={props.history} screen="edit" playlistId={pid} tempSongs={tempPlaylistSongs} setTempColors={setTempColors} deleteSong={deleteSong} addSongLocal={addSong}></SongRowCard>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )) : <></>}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </Content>
                        </Layout>
                    </Layout>
                </>
            );
        }
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

const EDIT_PLAYLIST_MUTATION = gql`
    mutation editPlaylist($playlistId: ID!, $name: String!, $isPrivate: Boolean!, $cover: String!, $songs: [SongInput]) {
        editPlaylist(playlistId: $playlistId, name: $name, isPrivate: $isPrivate, cover: $cover, songs: $songs) {
            id
            name
            creator
            cover
            isPrivate
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

const DELETE_PLAYLIST_MUTATION = gql`
    mutation deletePlaylist($playlistId: ID!) {
        deletePlaylist(playlistId: $playlistId)
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

export default withRouter(EditPlaylistScreen);