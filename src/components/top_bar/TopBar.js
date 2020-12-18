import React, { useContext, useState, useEffect } from 'react';
import './TopBar.css';
import { Menu, Avatar, Dropdown } from "antd";
import { ArrowDropDown } from '@material-ui/icons';

import { AuthContext } from '../../context/auth';
import { gql, useQuery } from '@apollo/client';

import { Link } from "react-router-dom";
import { GlobalContext } from "../../GlobalState";

function TopBar() {
    const [{ context }, dispatch] = useContext(
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

    const { user, logout } = useContext(AuthContext);
    const [picture, setPicture] = useState("");

    const { loading: loadingUser, data: dataUser = {} } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user.username
        },
    });
    const thisUser = dataUser.getUser;

    useEffect(() => {
        if (thisUser) {
            setPicture(thisUser.picture);
        }
    }, [thisUser]);

    function logoutCallback(){
        if (context.state !== "closed") {
            context.close();
        }
        setCurrentSong(null);
        setContext(new AudioContext());
        setSource(null);
        setPlaying(false);
        setCurrentPlaylist(null);
        logout();
    }

    let menu = (
        <Menu mode="horizontal" className="topbar" triggerSubMenuAction="click">
            <Menu.Item id="topbar-dropdown-username" disabled="true">{user.username}</Menu.Item>
            <Menu.Divider />
            <Menu.Item>
                <Link to={"/profile/" + user.username} username={user.username}>Profile</Link>
            </Menu.Item>
            <Menu.Item>
                <Link to="/settings">Settings</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={()=>logoutCallback()}><Link to="/">Log Out</Link></Menu.Item>

        </Menu>
    );

    if (loadingUser) {
        return <p></p>;
    } else {
        return (
            <Dropdown overlay={menu} trigger={['click']} theme="default">
                <a id="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <div id="user-menu">
                        <Avatar id="user-avatar" src={picture}></Avatar>
                        <ArrowDropDown id="menu-arrow" fontSize="large"></ArrowDropDown>
                    </div>
                </a>
            </Dropdown>
        );
    }
};

const FETCH_USER_QUERY = gql`
  query($username: String!) {
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

export default TopBar;