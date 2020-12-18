import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import './ContentCard.css';
import { Card, Avatar, Row, Col, Tooltip } from "antd";
import { gql, useQuery } from '@apollo/client';

function UserCard({ user, history }) {

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

    // USER FUNCTIONS
    function goToUser() {
        // console.log(history);
        history.push('/profile/' + user.username);
    }

    if (loadingUser) {
        return <p>Loading...</p>;
    } else {
        return (
            <Card className="content-tile-container" size="small" hoverable={true} bordered={false} onClick={goToUser}>
                <Row gutter={8} wrap={false}>
                    <Col span={9}>
                        {console.log("HI", user)}
                        <Row><Avatar className="thumbnail" size={128} src={picture}></Avatar></Row>
                    </Col>

                    <Col span={15}>
                        <div className="text-info">
                            <Row>
                                <ul>
                                    <Tooltip placement="top" title={user.username}>
                                        <li className="content-title">{user.username}</li>
                                    </Tooltip>
                                    <li className="content-subtitle">{""}</li>
                                </ul>
                            </Row>
                        </div>
                    </Col>

                </Row>
            </Card >
        );
    }
}

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

export default withRouter(UserCard);