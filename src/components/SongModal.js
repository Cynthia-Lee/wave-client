import React, { useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Button, Modal, Form, Input, Select } from 'antd';

import { AuthContext } from '../context/auth';
import { gql, useQuery } from '@apollo/client';

const SongModal = (props) => { // { visible, onCreate, onCancel, onChange }
    const [form] = Form.useForm();
    const { Option } = Select;

    const { user, logout } = useContext(AuthContext);
    const { loading, error, data = {} } = useQuery(FETCH_PLAYLISTS_QUERY);
    const thesePlaylists = data.getPlaylists;

    if (loading) {
        return <p>Loading...</p>;
    } else {
        
        let userPlaylists = thesePlaylists.filter(playlist => playlist.creator == user.username);
        let playlistsNames = userPlaylists.map(playlist => playlist.name);
        let i = 0;
        
        return (
            <Modal
                visible={props.visible}
                title="Add Song to Playlist"
                okText="Add"
                cancelText="Cancel"
                onCancel={props.onCancel}
                onOk={props.onCreate}
                okButtonProps={{ style: { color: "black" } }}
            >
                <Select
                    showSearch
                    style={{ width: 300 }}
                    placeholder="Select Playlist"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onChange={(value) => {
                        props.onChange(userPlaylists[value].id) // pass value to parent
                    }}
                >

                    {playlistsNames.map(name => (
                        <Option value={i++}>{name}</Option>
                    ))}

                </Select>
            </Modal>
        );
    }
}

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
      }
    }
  }
`;

export default SongModal;