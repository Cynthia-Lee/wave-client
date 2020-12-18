import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import './ContentCard.css';
import { Menu, Dropdown, Card, Avatar, Row, Col, Tooltip, Modal } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Favorite, MoreHoriz, FavoriteBorder } from '@material-ui/icons';
import { AuthContext } from '../../context/auth';
import { gql, useMutation, useQuery } from '@apollo/client';

import { GlobalContext } from "../../GlobalState";

import ShareModal from '../ShareModal';

const { confirm } = Modal;

function PlaylistCard({ playlist, history }) {

    const [{ currentPlaylist, playing }] = useContext(
        GlobalContext
    );

    const { user } = useContext(AuthContext);
    // const [seeDeleteModal, setSeeDeleteModal] = useState(false);
    const [visible, setVisible] = useState(false);

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
        var index = thisUser.likedPlaylists.indexOf(playlist.id);
        // console.log(index);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likePlaylist] = useMutation(LIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: playlist.id
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    const [unlikePlaylist] = useMutation(UNLIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: playlist.id
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

    // PLAYLIST FUNCTIONS
    function goToPlaylist() {
        console.log(history);
        history.push('/playlist/' + playlist.id);
    }

    const [deletePlaylist] = useMutation(DELETE_PLAYLIST_MUTATION, {
        variables: { playlistId: playlist.id },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
    });

    function deletePlaylistCallback() {
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

    function showShareModal(e) {
        e.domEvent.stopPropagation();
        setVisible(true);
    }

    // COPY PLAYLIST FUNCTIONS
    const [copyPlaylist] = useMutation(COPY_PLAYLIST_MUTATION, {
        variables: {
            name: playlist.name + ' (Copy)',
            cover: playlist.cover,
            isPrivate: true,
            songs: setSongs(playlist.songs),
            totalTime: playlist.totalTime
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }],
        update(_, result) {
            // send to edit screen of selected playlist
            history.push('/edit/' + result.data.copyPlaylist.id);

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
        console.log(setSongs(playlist.songs));
        copyPlaylist();
    }

    let menu = null;
    menu = (
        <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
            {playlist.creator == user.username ? <><Menu.Item><Link onClick={e => e.stopPropagation()} to={"/edit/" + playlist.id}>Edit</Link></Menu.Item><Menu.Item onClick={e => showDeleteModal(e)}>Delete</Menu.Item></> : <></>}
            <Menu.Item onClick={(e) => copyPlaylistCallback(e)}>Copy Playlist</Menu.Item>
            {playlist.isPrivate ? <></> : <Menu.Item onClick={(e) => showShareModal(e)}>Share Playlist</Menu.Item>}
        </Menu >
    );

    return (
        <>
            <ShareModal
                visible={visible}
                playlist={playlist}
                onCancel={() => {
                    setVisible(false);
                }}
            >
            </ShareModal>

            <Card className="content-tile-container" size="small" hoverable={true} bordered={false} onClick={goToPlaylist}>
                <Row gutter={8}>
                    <Col span={9}>
                        <Row><Avatar className="thumbnail" size={128} shape="square" src={playlist.cover}></Avatar></Row>
                    </Col>

                    <Col span={13}>
                        <div className="text-info">
                            <Row>
                                <ul>
                                    <Tooltip placement="top" title={<div dangerouslySetInnerHTML={{ __html: playlist.name }}></div>}>
                                        <li className="content-title"><div style={playing && currentPlaylist == playlist.id?{color: "#00EDCC"}:{}}dangerouslySetInnerHTML={{ __html: playlist.name }}></div></li>
                                    </Tooltip>
                                    <li className="content-subtitle"><Link onClick={e => e.stopPropagation()} to={"/profile/" + playlist.creator}>{playlist.creator}</Link></li>
                                </ul>
                            </Row>
                        </div>
                    </Col>

                    <Col span={2}>
                        <div className="controls">
                            <div className="control-icons">
                                <Dropdown overlay={menu} trigger={['click']}>
                                    <a className="ant-dropdown-link no-spacing" onClick={e => { e.stopPropagation(); }}>
                                        <div className="user-menu">
                                            <MoreHoriz className="menu-arrow"></MoreHoriz>
                                        </div>
                                    </a>
                                </Dropdown>
                                {!playlist.isPrivate ? isFavorite ? <Favorite className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite> : <FavoriteBorder className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder> : <></> }
                            </div>
                        </div>
                    </Col>

                </Row>
            </Card >
        </>
    );
}

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

export default withRouter(PlaylistCard);