import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Row, Col, Progress, Slider, Tooltip, Spin } from 'antd';
import { Favorite, FavoriteBorder, QueueMusic, BarChartRounded, SkipNext, SkipPrevious, PlayArrow, Pause, Repeat, VolumeUp } from '@material-ui/icons';
import { Link, withRouter } from "react-router-dom";
import './Widget.css';

import { GlobalContext } from "../../GlobalState";
import { AuthContext } from '../../context/auth';
import { gql, useMutation, useQuery } from '@apollo/client';

function Widget(props) {

    const { user } = useContext(AuthContext);
    const [isFavorite, setFavorite] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [time, setTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [slideTime, setSlideTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [gain, setGain] = useState(null);
    const [duration, setDuration] = useState(1);

    const [end, setEnd] = useState(false);

    const [{ context, source, currentSong, playing, currentPlaylist }, dispatch] = useContext(
        GlobalContext
    );

    const setCurrentSong = data => {
        dispatch({ type: "setCurrentSong", snippet: data });
    };

    const setContext = data => {
        dispatch({ type: "setContext", snippet: data });
    };

    const setSource = data => {
        dispatch({ type: "setSource", snippet: data });
    };

    const setPlaying = data => {
        dispatch({ type: "setPlaying", snippet: data });
    };

    const setCurrentPlaylist = data => {
        dispatch({ type: "setCurrentPlaylist", snippet: data });
    };

    function handleClick() {
        props.history.push('/audioVisual');

        //switch between expand and shrink icon
        // if on audio visual 

    }

    const { loadingP, errorP, data: dataP = {} } = useQuery(FETCH_PLAYLIST_QUERY, {
        variables: {
            playlistId: currentPlaylist
        },
    });
    const thisPlaylist = dataP.getPlaylist;

    function playNext() {
        setPlaying(false);
        //console.log("I GO NEXT")
        //console.log(thisPlaylist);
        if (thisPlaylist && thisPlaylist.songs[thisPlaylist.songs.indexOf(thisPlaylist.songs.find(song => song.id === currentSong.id)) + 1]) {
            setCurrentSong(thisPlaylist.songs[thisPlaylist.songs.indexOf(thisPlaylist.songs.find(song => song.id === currentSong.id)) + 1]);
        } else {
            setCurrentSong(null);
            setCurrentPlaylist(null);
        }
    }

    useEffect(() => {
        if (end) {
            playNext();
            setEnd(false);
        }
    }, [end]);

    useEffect(() => {
        console.log("I CHANGE I FOUND MESELF");
        console.log(thisPlaylist);
    }, [thisPlaylist]);


    function playPrevious() {
        setPlaying(false);
        setCurrentSong(thisPlaylist.songs[thisPlaylist.songs.indexOf(thisPlaylist.songs.find(song => song.id === currentSong.id)) - 1]);
    }

    useEffect(() => {
        setLoading(false);
        if (context.state != "closed") {
            context.close();
        }
        
        if(gain){
            gain.disconnect();
            console.log("dc");
        }

        if (source) {
            source.disconnect();
            console.log("dc");
        }

        if (currentSong) {
            let res_ctx = new AudioContext();
            setSource(res_ctx.createBufferSource());
            setGain(res_ctx.createGain());
            setContext(res_ctx);
        }
    }, [currentSong]);

    useEffect(() => {
        //console.log(currentSong);
        if (currentSong) {
            playSong(currentSong.videoId);
        }
    }, [context]);



    function playSong(id) {
        function process(Data) {
            context.decodeAudioData(Data, function (buffer) {
                if (source.buffer == null) {
                    source.buffer = buffer;
                }
                source.connect(gain);

                gain.connect(context.destination);

                source.start(0);
                source.onended = function () {
                    setEnd(true);
                };
                setLoading(false);
                setPlaying(true);
                setStartTime(context.currentTime);
                setTime(0);
                setSlideTime(0);
                setDuration(source.buffer.duration);
                //setOffset(0);
            });
        };

        function loadSound() {
            setLoading(true);
            var request = new XMLHttpRequest();
            request.open("GET", "https://vast-wave-49452.herokuapp.com/music/" + id, true);
            request.responseType = "arraybuffer";

            request.onload = function () {
                var Data = request.response;
                process(Data);
            };

            request.send();
        };
        loadSound();
    }

    function pauseSong() {
        context.suspend();
        setPlaying(false);
    }

    function resumeSong() {
        context.resume();
        setPlaying(true);
    }

    // USER LIKE FUNCTIONS
    const { loadingU, error: errorU, data: dataU = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = dataU.getUser;

    useEffect(() => {
        if (thisUser) {
            setFavorite(checkFavorite());
        }
    }, [thisUser, currentSong]);

    useEffect(() => {
        if (gain) {
            gain.gain.value = volume / 100;
        }
    }, [volume, gain]);

    function handleVolumeChange(value) {
        setVolume(value); // browser's volume
    }

    function checkFavorite() {
        if (!currentSong) {
            return false;
        }
        var index = thisUser.likedSongs.indexOf(currentSong.videoId);
        if (index <= -1) {
            return false;
        }
        return true;
    }

    const [likeSong, { error: errorL }] = useMutation(LIKE_SONG_MUTATION, {
        variables: {
            videoId: currentSong ? currentSong.videoId : ""
        },
    });

    const [unlikeSong, { error: errorUL }] = useMutation(UNLIKE_SONG_MUTATION, {
        variables: {
            videoId: currentSong ? currentSong.videoId : ""
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

    function favoriteIcon() {
        if (isFavorite && currentSong) {
            return <Favorite className="heart" onClick={(e) => toggleFavorite(isFavorite, e)}></Favorite>;
        } else if (currentSong) {
            return <FavoriteBorder className="heart" onClick={(e) => toggleFavorite(isFavorite, e)}></FavoriteBorder>;
        } else {
            return <></>;
        }
    }

    function formatTime(secs) {
        let hours = Math.floor(secs / 3600);
        let minutes = Math.floor(secs / 60) % 60;
        let seconds = Math.round(secs % 60);
        return [hours, minutes, seconds]
            .map(v => ('' + v).padStart(2, '0'))
            .filter((v, i) => v !== '00' || i > 0)
            .join(':');
    }

    useEffect(() => {
        if (currentSong) {
            const interval = setInterval(() => {
                setTime(Math.ceil(context.currentTime - startTime));
                setSlideTime((context.currentTime - startTime).toFixed(3));
            });
            return () => {
                clearInterval(interval);
            };
        }

    }, [slideTime, time, context]);

    return (
        <div id='widget'>
            <audio id="WAWA"></audio>

            <Row align="middle" wrap={false} gutter={24}>

                <Col><Avatar shape='square' size={60} src={currentSong ? currentSong.thumbnail : ""}></Avatar></Col>

                <Col span={5} style={{ minWidth: "50px" }}>
                    <Link to={currentSong ? '/song/' + currentSong.videoId : {}}>
                        <ul>
                            <Tooltip placement="top" title={<div dangerouslySetInnerHTML={currentSong ? { __html: currentSong.title } : { __html: "" }}></div>}>
                                <li className="widget-song-name"><div className="elip" dangerouslySetInnerHTML={currentSong ? { __html: currentSong.title } : { __html: "" }}></div></li>
                            </Tooltip>
                            <li className="widget-artist-name"><div className="elip" dangerouslySetInnerHTML={currentSong ? { __html: currentSong.channelTitle } : { __html: "" }}></div></li>
                        </ul>
                    </Link>
                </Col>

                <Col>
                    <Row gutter={16} wrap={false} style={{ marginLeft: "14px", marginRight: "14px" }}>
                        <Col className="center-icon">
                            {favoriteIcon()}
                        </Col>
                        <Col className="center-icon">{currentPlaylist ? <Link to={"/playlist/" + currentPlaylist}><QueueMusic /></Link> : <></>}</Col>
                        <Col className="center-icon">{isLoading ? <Spin /> : <BarChartRounded className="heart" style={{cursor:"pointer"}} onClick={() => handleClick()}></BarChartRounded>}</Col>
                    </Row>
                </Col>


                <Col span={10}>
                    <Row wrap={false}>
                        <Col span={8} />
                        <Col span={8}>
                            <Row justify="center" gutter={32} wrap={false}>
                                {currentPlaylist && !isLoading && currentSong && thisPlaylist && thisPlaylist.songs.indexOf(thisPlaylist.songs.find(song => song.id === currentSong.id)) > 0 ? <Col><SkipPrevious onClick={() => playPrevious()} /></Col> : <Col><SkipPrevious className="disabled" /></Col>}
                                <Col>{currentSong ? playing ? <Pause className="heart" onClick={() => pauseSong()} /> : <PlayArrow className="heart" onClick={() => resumeSong()} /> : <PlayArrow />}</Col>
                                {currentPlaylist && !isLoading && currentSong && thisPlaylist && thisPlaylist.songs.indexOf(thisPlaylist.songs.find(song => song.id === currentSong.id)) < thisPlaylist.songs.length - 1 ? <Col><SkipNext onClick={() => playNext()} /></Col> : <Col><SkipNext className="disabled" /></Col>}
                            </Row>
                        </Col>
                        <Col span={8}>

                            <Row wrap={false}>
                                <Col className="center-icon">{false ? <Repeat /> : <></>}</Col>
                            </Row>

                        </Col>
                    </Row>



                    <Row align="middle" wrap={false} gutter={8}>
                        <Col>{isLoading || !currentSong ? "0:00" : formatTime(time)}</Col>
                        <Col span={22}><Slider disabled={!currentSong || isLoading} tipFormatter={null} step={0.001} value={isLoading || !currentSong ? 0 : slideTime} max={duration} /></Col>
                        <Col>{source && source.buffer && currentSong ? formatTime(source.buffer.duration) : "0:00"}</Col>
                    </Row>
                </Col>


                <Col flex="auto">
                    <Row justify="end" align="middle" gutter={16} wrap={false}>
                        <Col className="center-icon"><VolumeUp /></Col>
                        <Col style={{ minWidth: "150px" }}><Slider tooltipVisible={false} value={volume} onChange={value => handleVolumeChange(value)} max={100} /></Col>
                        <Col style={{ minWidth: "40px" }}>{volume}</Col>
                    </Row>
                </Col>

            </Row>
        </div>
    )
}

const FETCH_USERS_QUERY = gql`
    query getUsers {
        id
        email
        username
        volume
        likedSongs
        likedPlaylists
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

const LIKE_SONG_MUTATION = gql`
    mutation likeSong($videoId: String!) {
        likeSong(videoId: $videoId) {
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

const UNLIKE_SONG_MUTATION = gql`
    mutation unlikeSong($videoId: String!) {
        unlikeSong(videoId: $videoId) {
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

const SET_VOLUME_MUTATION = gql` 
    mutation($volume: Int!) {
        setVolume(volume: $volume) {
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
export default withRouter(Widget);