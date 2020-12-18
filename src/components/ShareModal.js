import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Button, Modal, Input, message } from 'antd';

const { Search } = Input;

const ShareModal = ({ visible, playlist, onCancel}) => {
    const onCopy = () => {
        let copyArea = document.getElementById("search-copy");
        copyArea.focus();
        copyArea.select();
        document.execCommand('copy');
        message.success('Link copied to clipboard!');
    }

    return (
        <Modal
            visible={visible}
            title="Share Playlist"
            onCancel={onCancel}
            footer={null}
        >
            <Search
                id="search-copy"
                defaultValue={'http://localhost:3000/playlist/' + playlist.id}
                enterButton="Copy"
                size="medium"
                onSearch={onCopy}
            />
        </Modal>
    );
}

export default ShareModal;