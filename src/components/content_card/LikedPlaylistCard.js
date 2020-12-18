import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import './ContentCard.css';
import { Menu, Dropdown, Card, Avatar, Row, Col, Image, Tooltip, Modal, Result, Button } from "antd";
import { WarningFilled } from '@ant-design/icons';
import { Favorite, MoreHoriz, FavoriteBorder } from '@material-ui/icons';
import { AuthContext } from '../../context/auth';
import { gql, useMutation, useQuery } from '@apollo/client';

import { GlobalContext } from "../../GlobalState";

import ShareModal from '../ShareModal';
import ErrorPage from '../error_page/ErrorPage';

const { confirm } = Modal;

function PlaylistCard({ playlistId, history, usernameLink }) {

    const [{ currentPlaylist, playing }, dispatch] = useContext(
        GlobalContext
    );

    const { user } = useContext(AuthContext);
    const [visible, setVisible] = useState(false);

    const [isFavorite, setFavorite] = useState(false);

    /*
    id: ID!
    name: String!
    creator: String!
    cover: String!
    isPrivate: Boolean!
    totalTime: Int!
    // totalLikes: Int!
    songs: [Song]!
    */

    const [name, setName] = useState("");
    const [creator, setCreator] = useState("");
    const [cover, setCover] = useState("");
    const [isPrivate, setIsPrivate] = useState(true);
    const [totalTime, setTotalTime] = useState(0);
    const [playlistSongs, setPlaylistSongs] = useState("");

    const { loading: loadingP, error: errorP, data: dataP = {} } = useQuery(FETCH_PLAYLIST_QUERY, {
        variables: {
            playlistId: playlistId
        },
    });
    const thisPlaylist = dataP.getPlaylist;

    useEffect(() => {
        if (thisPlaylist) {
            setName(thisPlaylist.name);
            setCreator(thisPlaylist.creator);
            setCover(thisPlaylist.cover);
            setIsPrivate(thisPlaylist.isPrivate);
            setTotalTime(thisPlaylist.totalTime);
            setPlaylistSongs(thisPlaylist.songs);
        }
    }, [thisPlaylist]);

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
        var index = thisUser.likedPlaylists.indexOf(playlistId);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likePlaylist, { error: errorL }] = useMutation(LIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: playlistId
        },
        //refetchQueries: [{ query: FETCH_USER_QUERY }]
    });

    const [unlikePlaylist, { error: errorUL }] = useMutation(UNLIKE_PLAYLIST_MUTATION, {
        variables: {
            playlistId: playlistId
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
        history.push('/playlist/' + playlistId);
    }

    /*
    const [deletePlaylist, { error }] = useMutation(DELETE_PLAYLIST_MUTATION, {
        variables: { playlistId: playlistId },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
    });
    */

    function showDeleteModal(e) {
        e.domEvent.stopPropagation();
        showConfirm(); // modal
    }

    function showConfirm() {
        Modal.error({
            title: 'You cannot delete a favorited playlist!',
            // icon: <CloseCircleFilled />,
            okButtonProps: { style: { color: "black" } },
        });
    }

    function showShareModal(e) {
        e.domEvent.stopPropagation();
        setVisible(true);
    }

    // COPY PLAYLIST FUNCTIONS
    const [copyPlaylist, { error: copyError }] = useMutation(COPY_PLAYLIST_MUTATION, {
        variables: {
            name: name + ' (Copy)',
            cover: cover,
            isPrivate: true,
            songs: setSongs(playlistSongs),
            totalTime: totalTime
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
        console.log(setSongs(playlistSongs));
        copyPlaylist();
    }

    let menu = null;
    menu = (
        <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
            {creator == user.username ? <><Menu.Item><Link onClick={e => e.stopPropagation()} to={"/edit/" + playlistId}>Edit</Link></Menu.Item><Menu.Item onClick={e => showDeleteModal(e)}>Delete</Menu.Item></> : <></>}
            <Menu.Item onClick={(e) => copyPlaylistCallback(e)}>Copy Playlist</Menu.Item>
            {isPrivate ? <></> : <Menu.Item onClick={(e) => showShareModal(e)}>Share Playlist</Menu.Item>}
        </Menu >
    );

    if (loadingP) {
        return <p>Loading...</p>;
    } else {
        if (thisPlaylist == undefined) {
            return (
                <Card className="content-tile-container" size="small" hoverable={true} bordered={false}>
                    <Result className="deadPlaylist"
                        // status="warning"
                        icon={<WarningFilled className="deadPlaylistIcon" />}
                        title="Deleted Playlist"
                        subTitle="This playlist no longer exists."
                        extra={ usernameLink == user.username ? 
                            <Button type="" onClick={unlikePlaylist}>
                                Remove from Liked Playlists
                            </Button> 
                            : 
                            <div className="deadSpace"></div>
                        }
                    />
                </Card>
            );
            // return <ErrorPage />;
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

                <Card className="content-tile-container" size="small" hoverable={true} bordered={false} onClick={goToPlaylist}>
                    <Row gutter={8}>
                        <Col span={9}>
                            <Row><Avatar className="thumbnail" size={128} shape="square" src={cover}></Avatar></Row>
                        </Col>

                        <Col span={13}>
                            <div className="text-info">
                                <Row>
                                    <ul>
                                        <Tooltip placement="top" title={<div dangerouslySetInnerHTML={{ __html: name }}></div>}>
                                            <li className="content-title"><div style={playing && currentPlaylist == playlistId?{color: "#00EDCC"}:{}} dangerouslySetInnerHTML={{ __html: name }}></div></li>
                                        </Tooltip>
                                        <li className="content-subtitle"><Link onClick={e => e.stopPropagation()} to={"/profile/" + creator}>{creator}</Link></li>
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
                                    {!isPrivate ? isFavorite ? <Favorite className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite> : <FavoriteBorder className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder> : <></>}
                                </div>
                            </div>
                        </Col>

                    </Row>
                </Card >
            </>
        );
    }
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

export default withRouter(PlaylistCard);