import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/auth';
import { Layout } from 'antd';

import Widget from './Widget';

const { Footer } = Layout;

function AuthWidget() {
    const { user } = useContext(AuthContext);

    return (
        <>{user ? <Footer className="authFooter"><Widget></Widget></Footer> : <></>}</>
    );

}

export default AuthWidget;