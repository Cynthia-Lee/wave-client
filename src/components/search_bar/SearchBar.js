import React, { useContext, useEffect, useState } from 'react';
import './SearchBar.css';
import { Menu, Avatar, Dropdown, Input } from "antd";
import { ArrowDropDown, Search } from '@material-ui/icons';
import { AuthContext } from '../../context/auth';
import { gql, useQuery } from '@apollo/client';

import { Link } from "react-router-dom";

function SearchBar({ onSubmit }) {
    const { user, logout } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (event) => setSearchTerm(event.target.value);

    const onKeyPress = (event) => {
        if (event.key === "Enter") {
            onSubmit(searchTerm);
        }
    }

    const [picture, setPicture] = useState("");

    const { data: dataUser = {} } = useQuery(FETCH_USER_QUERY, {
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

    //render() {
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
            <Menu.Item onClick={logout}><Link to="/">Log Out</Link></Menu.Item>

        </Menu>
    );

    return (
        <div>
            <div id="search">
                <Input placeholder="Search for Songs, Playlists, or Users" prefix={<Search />} onKeyPress={onKeyPress} onChange={handleChange}></Input>
            </div>
            <Dropdown overlay={menu} trigger={['click']}>
                <a id="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <div id="user-menu">
                        <Avatar id="user-avatar" src={picture}></Avatar>
                        <ArrowDropDown id="menu-arrow" fontSize="large"></ArrowDropDown>
                    </div>
                </a>
            </Dropdown>
        </div>
    );
    //}
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

export default SearchBar;