import React, { useContext } from 'react';
import { Menu } from "antd";
import Logo from "../Logo";
import './Sidebar.css';
import AudioVisualSmall from "../audio_visual_small/AudioVisualSmall";
import { Search, LibraryMusic, Favorite, History, AddCircleOutline } from '@material-ui/icons';
import { Link, withRouter } from "react-router-dom";

import { AuthContext } from '../../context/auth';
import { gql, useMutation } from '@apollo/client';

function Sidebar(props) {
    // const { user } = useContext(AuthContext);

    const [createPlaylist, { error }] = useMutation(CREATE_PLAYLIST_MUTATION, {
        variables: {
            name: "Untitled Playlist",
            cover: "https://static1.squarespace.com/static/5d2e2c5ef24531000113c2a4/5d392a924397f100011fa30e/5d4af5c5c7e44500015d62dd/1580455005536/?format=1500w",
            isPrivate: true
        },
        refetchQueries: [{ query: FETCH_PLAYLISTS_QUERY }],
        update(_, result) {
            // send to edit screen of selected playlist
            // let history = useHistory();
            props.history.push('/edit/' + result.data.createPlaylist.id);
        }
    })

    function createPlaylistCallback() {
        createPlaylist();
    }

    return (
        <>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={[props.active]}>
                <div style={{ textAlign: "center", height: "3rem", width: "auto", paddingTop: "0.8rem", marginBottom: "40px" }}>
                    <Link className="link" to="/library"><Logo style={{ height: "100%" }}></Logo></Link>
                </div>

                <Menu.Item key="search" icon={<Search />} className="item">
                    <Link className="link" to="/search">Search</Link>
                </Menu.Item>
                <Menu.Item key="yourPlaylists" icon={<LibraryMusic />} className="item">
                    <Link className="link" to="/library">Your Playlists</Link>
                </Menu.Item>
                <Menu.Item key="likedContent" icon={<Favorite className="heart" />} className="item">
                    <Link className="link" to="/likedContent">Favorites</Link>
                </Menu.Item>

                <Menu.Item onClick={createPlaylistCallback} key="createPlaylist" id="createPlaylist" icon={<AddCircleOutline />} className="item">
                    <a className="link">Create Playlist</a>
                </Menu.Item>
            </Menu>
            {props.active === "audiovisual" ? <></> : <AudioVisualSmall></AudioVisualSmall>}
        </>
    );
};

/*
<Menu.Item key="songHistory" icon={<History />} className="item">
    <Link className="link" to="/history">Song History</Link>
</Menu.Item>
*/

const CREATE_PLAYLIST_MUTATION = gql`
    mutation createPlaylist($name: String!, $cover: String!, $isPrivate: Boolean!) {
        createPlaylist(name: $name, cover: $cover, isPrivate: $isPrivate) {
            id name creator cover isPrivate 
            songs {
                videoId
            }
        }
    }
`

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

export default withRouter(Sidebar);