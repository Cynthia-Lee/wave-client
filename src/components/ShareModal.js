import React from 'react';
import 'antd/dist/antd.css';
import { Modal, Input, message } from 'antd';

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
                defaultValue={'https://wave-music.netlify.app/playlist/' + playlist.id}
                enterButton="Copy"
                size="medium"
                onSearch={onCopy}
            />
        </Modal>
    );
}

export default ShareModal;