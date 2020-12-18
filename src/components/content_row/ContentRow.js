import React from 'react';
import SongCard from "../content_card/SongCard";
import PlaylistCard from "../content_card/PlaylistCard";
import UserCard from "../content_card/UserCard";
import LikedSongCard from "../content_card/LikedSongCard";
import LikedPlaylistCard from "../content_card/LikedPlaylistCard";
import './ContentRow.css';
import { Row, Col } from "antd";

export default ({ type, history, playlists, videos, users, videoIds, playlistIds, usernameLink }) => {
    //console.log(history);
    let listOfContent = [];
    //console.log(videos);

    if (type === "song") {
        listOfContent = videos.map(video => (
            <Col span={6}>
                <SongCard
                    key={video.id.videoId}
                    video={video}
                    history={history}
                />
            </Col>
        ));
    } else if (type === "playlist") {
        listOfContent = playlists.map(playlist => (
            <Col span={6}>
                <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    history={history}
                />
            </Col>
        ));
    } else if (type === "user") {
        listOfContent = users.map(user => (
            <Col span={6}>
                <UserCard
                    key={user.id}
                    user={user}
                    history={history}
                />
            </Col>
        ));
    } else if (type === "likedSong") {
        listOfContent = videoIds.map(videoId => (
            <Col span={6}>
                <LikedSongCard
                    key={videoId}
                    videoId={videoId}
                    history={history}
                />
            </Col>
        ));
    } else if (type === "likedPlaylist") {
        listOfContent = playlistIds.map(playlistId => (
            <Col span={6}>
                <LikedPlaylistCard
                    key={playlistId}
                    playlistId={playlistId}
                    usernameLink={usernameLink}
                    history={history}
                />
            </Col>
        ));
    } else {
        listOfContent = [];
    }

    return (
        <Row gutter={[24, 16]} className="content-row">
            {listOfContent}
        </Row>
    );

};