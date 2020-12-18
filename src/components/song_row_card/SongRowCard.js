import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import './SongRowCard.css';
import { Menu, Dropdown, Card, Avatar, Row, Col, Form, Modal, message, Button } from "antd";
import { Favorite, FavoriteBorder, MoreHoriz, PlayArrow, Pause, Lens } from '@material-ui/icons';
import SongModal from "../SongModal";
import ColorModal from "../color_modal/ColorModal";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/auth';
import { gql, useMutation, useQuery } from '@apollo/client';
import { GlobalContext } from "../../GlobalState";

const { confirm } = Modal;

function SongRowCard({ index, id, videoId, title, channelTitle, thumbnail, duration, colors, history, screen, playlistId, tempSongs, setTempColors, deleteSong, addSongLocal }) { // ({ title, subtitle, duration }) {
  const { user } = useContext(AuthContext);
  const [isFavorite, setFavorite] = useState(false);

  const [{ playing, currentSong, context, currentPlaylist }, dispatch] = useContext(GlobalContext);

  const setCurrentSong = data => {
    dispatch({ type: "setCurrentSong", snippet: data });
  };

  const setPlaying = data => {
    dispatch({ type: "setPlaying", snippet: data });
  };

  const setCurrentPlaylist = data => {
    dispatch({ type: "setCurrentPlaylist", snippet: data });
  };

  function pauseSong(e) {
    e.stopPropagation();
    context.suspend();
    setPlaying(false);
  }

  function resumeSong() {
    context.resume();
    setPlaying(true);
  }

  // COVER IMAGE MODAL CONTROLS
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // ADD SONG FUNCTIONS

  const [addSong, { addError }] = useMutation(ADD_SONG_MUTATION, {
    variables: {
      playlistId: selectedPlaylistId, videoId: videoId, title: title, channelTitle: channelTitle, thumbnail: thumbnail,
      duration: duration, colors: ["#00D4D9", "#00E2A9"]
    },
    refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
  });


  function onCreate() {
    // console.log(thumbnail);//
    // console.log(colors); //
    if (screen == "edit" && selectedPlaylistId == playlistId) {
      addSongLocal({
        id: id,
        videoId: videoId,
        title: title,
        channelTitle: channelTitle,
        thumbnail: thumbnail,
        duration: duration,
        colors: ["#00D4D9", "#00E2A9"]
      });
    } else if (selectedPlaylistId) {
      addSong();
    } else {
      message.error('Song not added. No playlist was selected.');
    }
    setVisible(false);
  };

  /*
  function goToSongInfo() {
    console.log(history);
    history.push('/song/' + videoId);
  }
  */

  // DELETE SONG FUNCTIONS
  /*
  const [deleteSong, { deleteError }] = useMutation(DELETE_SONG_MUTATION, {
    variables: {
      playlistId: playlistId, index: index
    },
    refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }]
  });
  */

  function handleConfirm() {
    deleteSong(index);
    // setDelVisible(false);
  };

  function showDelete(e) {
    e.domEvent.stopPropagation();
    confirm({
      title: 'Are you sure you want to delete this song?',
      icon: <ExclamationCircleOutlined />,
      okButtonProps: { style: { color: "black" } },
      onOk() {
        console.log('OK');
        handleConfirm();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

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
    var index = thisUser.likedSongs.indexOf(videoId);
    console.log(index);
    if (index <= -1) {
      return false;
    }
    return true;
  }

  const [likeSong, { error: errorL }] = useMutation(LIKE_SONG_MUTATION, {
    variables: {
      videoId: videoId
    },
    //refetchQueries: [{ query: FETCH_USER_QUERY }]
  });

  const [unlikeSong, { error: errorUL }] = useMutation(UNLIKE_SONG_MUTATION, {
    variables: {
      videoId: videoId
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

  function changeCurrentSong(e) {
    e.stopPropagation();
    if (!currentSong || currentSong.videoId != videoId || currentSong.id != id) {
      setCurrentSong({
        id: id,
        videoId: videoId,
        title: title,
        channelTitle: channelTitle,
        thumbnail: thumbnail,
        duration: duration,
        colors: colors
      });
      setPlaying(false);
    } else {
      resumeSong();
    }
    if (currentPlaylist != playlistId) {
      setCurrentPlaylist(playlistId);
    }
  }

  function goToSongInfo() {
    history.push('/song/' + videoId);
  }

  // SONG COLOR PICKER FUNCTIONS
  const [visibleCP, setVisibleCP] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);

  let menu = (
    <Menu mode="horizontal" theme="dark" className="content-menu" triggerSubMenuAction="click">
      <Menu.Item onClick={(e) => {
        e.domEvent.stopPropagation();
        setVisible(true);
      }}>Add to playlist</Menu.Item>
      {screen == "edit" ?
        <Menu.Item onClick={(e) => {
          showDelete(e);
        }}>Delete</Menu.Item>
        : <></>}
    </Menu>
  );

  function onColor(colorValues) {
    if (tempSongs) {
      //tempSongs[index].colors = colorValues;
      console.log(index);
      setTempColors(index, colorValues);
    }
    console.log(colorValues);
    setVisibleCP(false);
  }

  return (
    <>
      <SongModal
        visible={visible}
        onCreate={onCreate} // onOk
        onCancel={() => {
          setVisible(false);
        }}
        onChange={(value) => setSelectedPlaylistId(value)}
      />

      <ColorModal
        visible={visibleCP}
        onCancel={() => {
          setVisibleCP(false);
        }}
        onColor={onColor} // onOk
        colors={colors}
        onChange={(value) => setSelectedColors(value)}
      />

      <Card className="song-content-tile-container" size="small" hoverable={true} bordered={false} onClick={screen != "edit" ?e => { goToSongInfo(e) }:e=>{}}>

        <Row align='middle' wrap={false}>
          {index + 1}
          <Col flex="3.5rem">
            {screen != "edit" ? playing && currentSong && currentSong.videoId == videoId && currentSong.id == id ? <Pause className="play-arrow" size="large" onClick={(e) => { pauseSong(e) }} /> : <PlayArrow className="play-arrow" size="large" onClick={(e) => changeCurrentSong(e)} /> : <PlayArrow onClick={e => e.stopPropagation()} className="play-arrow disabled" size="large" />}
          </Col>

          <Col flex="auto">
            <div className="song-text-info">
              <ul>
                <li className="song-content-title"><div style={playing && currentSong && currentSong.videoId == videoId && currentSong.id === id ? { color: "#00EDCC" } : {}} className="elip" dangerouslySetInnerHTML={{ __html: title }}></div></li>
                <li className="content-subtitle"><div className="elip" dangerouslySetInnerHTML={{ __html: channelTitle }}></div></li>
              </ul>
            </div>
          </Col>

          <Col flex="none">
            <div className="song-controls">
              <Row wrap={false}>

                {screen == "edit" ?
                  <Col>
                    <Button onClick={(e) => { e.stopPropagation(); setVisibleCP(true); }}
                      className="duration color-button"
                      shape="circle"
                      style={{ backgroundImage: "linear-gradient(" + colors[0] + "," + colors[1] + ")" }}
                      size="small">
                      <p />
                    </Button>
                  </Col>
                  :
                  <Col>
                    <Button onClick={(e) => { e.stopPropagation(); }}
                      className="duration color-button color-button-preview"
                      shape="circle"
                      style={{ backgroundImage: "linear-gradient(" + colors[0] + "," + colors[1] + ")" }}
                      size="small">
                      <p />
                    </Button>
                  </Col>
                }

                {isFavorite ? <Col><Favorite size="small" className="duration heart" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite></Col> : <Col><FavoriteBorder size="small" className="duration heart" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder></Col>}

                <Col>
                  <div className="duration" style={{ minWidth: "3rem", textAlign: "right" }}>{parseDuration(duration)}</div>
                </Col>

                <Col>
                  <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" id="song-dropdown-link" onClick={e => e.stopPropagation()}>
                      <div className="user-menu">
                        <MoreHoriz className="menu-arrow" fontSize="medium"></MoreHoriz>
                      </div>
                    </a>
                  </Dropdown>
                </Col>

              </Row>
            </div>

          </Col>

        </Row>
      </Card>
    </>
  );
};

/*{[this.props.heart]==="" ? <Favorite className="favorite"></Favorite> : ""}
                        {[this.props.edit]==="true" ? <Lens id="lens"></Lens> : ""}*/

function parseDuration(PT) {
  var output = [];
  var durationInSec = 0;
  var matches = PT.match(/P(?:(\d*)Y)?(?:(\d*)M)?(?:(\d*)W)?(?:(\d*)D)?T?(?:(\d*)H)?(?:(\d*)M)?(?:(\d*)S)?/i);
  var parts = [
    { // years
      pos: 1,
      multiplier: 86400 * 365
    },
    { // months
      pos: 2,
      multiplier: 86400 * 30
    },
    { // weeks
      pos: 3,
      multiplier: 604800
    },
    { // days
      pos: 4,
      multiplier: 86400
    },
    { // hours
      pos: 5,
      multiplier: 3600
    },
    { // minutes
      pos: 6,
      multiplier: 60
    },
    { // seconds
      pos: 7,
      multiplier: 1
    }
  ];

  for (var i = 0; i < parts.length; i++) {
    if (typeof matches[parts[i].pos] != 'undefined') {
      durationInSec += parseInt(matches[parts[i].pos]) * parts[i].multiplier;
    }
  }

  // Hours extraction
  if (durationInSec > 3599) {
    output.push(parseInt(durationInSec / 3600));
    durationInSec %= 3600;
  }
  // Minutes extraction with leading zero
  output.push(('0' + parseInt(durationInSec / 60)).slice(-2));
  // Seconds extraction with leading zero
  output.push(('0' + durationInSec % 60).slice(-2));

  return output.join(':');
};

const ADD_SONG_MUTATION = gql`
    mutation addSong($playlistId: ID!, $videoId: String!, $title: String!, $channelTitle: String!, $thumbnail: String!, $duration: String!) {
        addSong(playlistId: $playlistId, videoId: $videoId, title: $title, channelTitle: $channelTitle, thumbnail: $thumbnail, duration: $duration) {
            id
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

const DELETE_SONG_MUTATION = gql`
  mutation deleteSong($playlistId: ID!, $index: Int!) {
    deleteSong(playlistId: $playlistId, index: $index) {
      id
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

export default withRouter(SongRowCard);