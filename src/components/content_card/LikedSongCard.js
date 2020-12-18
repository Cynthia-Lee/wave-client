import React, { useContext, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import './ContentCard.css';
import { Menu, Dropdown, Card, Row, Col, Image, Tooltip, Modal, message } from "antd";
import { Favorite, MoreHoriz, FavoriteBorder } from '@material-ui/icons';
import { AuthContext } from '../../context/auth';
import { gql, useMutation, useQuery } from '@apollo/client';

import SongModal from "../../components/SongModal";
import youtube from '../../api/youtube';

import { GlobalContext } from "../../GlobalState";

function LikedSongCard({ videoId, playlist, history }) {

    const { user } = useContext(AuthContext);
    const [isBusy, setBusy] = useState(true);
    const [videoDuration, setVideoDuration] = useState(""); // search does not return
    const [isFavorite, setFavorite] = useState(false);

    const [title, setTitle] = useState("");
    const [channelTitle, setChannelTitle] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [visible, setVisible] = useState(false);

    const [mouseIn, setMouseIn] = useState(false);

    const [{ playing, currentSong }] = useContext(GlobalContext);

    useEffect(() => {
        youtube.get('/videos', {
            params: {
                part: "snippet,contentDetails", // returns videos
                key: "AIzaSyBAWxhQXBUqEIZ6Va60EAYzvhlRrRKOkWk",//process.env.YOUTUBE_API_KEY,
                id: videoId,
            }
        }).then((res) => {
            setVideoDuration(res.data.items[0].contentDetails.duration);
            setBusy(false);
            // console.log(res.data.items[0]);
            setTitle(res.data.items[0].snippet.title);
            setChannelTitle(res.data.items[0].snippet.channelTitle);
            setThumbnail(res.data.items[0].snippet.thumbnails.medium.url);
        });
    }, []);

    const [addSong, { error }] = useMutation(ADD_SONG_MUTATION, {
        variables: {
            playlistId: selectedPlaylistId,
            videoId: videoId,
            title: title,
            channelTitle: channelTitle,
            thumbnail: thumbnail,
            duration: videoDuration,
            colors: ["#00D4D9", "#00E2A9"]
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
    });

    function onCreate(e) { // prevent modal add button (onOk) click event
        if (selectedPlaylistId) {
            addSong();
        } else {
            message.error('Song not added. No playlist was selected.');
        }
        setVisible(false);
    };

    function addSongCallback(e) { // prevent menu item click event
        e.domEvent.stopPropagation();
        setVisible(true);
    }

    function goToSongInfo() {
        console.log(history);
        history.push('/song/' + videoId);
    }

    // USER LIKE FUNCTIONS
    const { data = {} } = useQuery(FETCH_USER_QUERY, {
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
        var index = thisUser.likedSongs.indexOf(videoId);
        console.log(index);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likeSong] = useMutation(LIKE_SONG_MUTATION, {
        variables: {
            videoId: videoId
        },
    });

    const [unlikeSong] = useMutation(UNLIKE_SONG_MUTATION, {
        variables: {
            videoId: videoId
        },
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

    let menu = null;
    menu = (
        <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
            <Menu.Item onClick={e => { addSongCallback(e) }}>Add to playlist</Menu.Item>
        </Menu>
    );

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

            <Card className="content-tile-container" size="small" hoverable={true} bordered={false} onClick={e => { goToSongInfo(e) }}>

                <Row wrap={false}>

                    <Col span={7}>
                        <Row>
                            <Image className="thumbnail" width={128} src={thumbnail} onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}></Image>
                        </Row>
                    </Col>

                    <Col span={17}>
                        <Row wrap={false}>

                            <Col span={21} style={{paddingRight:"12px", paddingLeft:"12px"}}>
                                <ul>
                                    <Tooltip placement="top" title={<div dangerouslySetInnerHTML={{ __html: title }}></div>}>
                                        <li className="content-title"><div style={playing && currentSong.videoId == videoId && currentSong.id == null?{color: "#00EDCC"}:{}} className="elip" dangerouslySetInnerHTML={{ __html: title }}></div></li>
                                    </Tooltip>
                                    <li className="content-subtitle"><div className="elip" dangerouslySetInnerHTML={{ __html: channelTitle }}></div></li>
                                </ul>

                            </Col>

                            <Col span={3}>
                                <ul>
                                    <li>
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <a className="ant-dropdown-link no-spacing" onClick={e => { e.stopPropagation(); }}>
                                                <div className="user-menu">
                                                    <MoreHoriz className="menu-arrow"></MoreHoriz>
                                                </div>
                                            </a>
                                        </Dropdown>
                                    </li>

                                    {isFavorite ? <li><Favorite className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite></li> : <li><FavoriteBorder className="heart" size="small" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder></li>}

                                </ul>
                            </Col>

                        </Row>
                    </Col>
                </Row>
            </Card>
        </>
    );


};

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
      totalTime
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

export default withRouter(LikedSongCard);