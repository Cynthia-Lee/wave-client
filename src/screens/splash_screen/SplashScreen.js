import React from 'react';
import { Layout, Menu, Button } from "antd";
import Logo from "./../../components/Logo";
import './SplashScreen.css';
const { Header, Content } = Layout;

export default class SplashScreen extends React.Component {
    render() {
        return (
            <Layout>
                <Header style={{ position: "fixed", zIndex: 1, width: "100%"}}>
                    <a href="/">
                        <Logo style={{ height: "80%", width: "auto", float: "left", paddingTop: "0.8rem"}}></Logo>
                    </a>
                    <Menu mode="horizontal" theme="dark">
                        <Menu.Item key="signup" style={{float: "right", fontWeight: 500}}>
                            <a href="/register">Sign Up</a> 
                        </Menu.Item>
                        <Menu.Item key="login" style={{float: "right", fontWeight: 500}}>
                            <a href="/login">Log In</a>
                        </Menu.Item>
                    </Menu>
                </Header>        
                
                <Content className="site-layout" id="splash-layout">
                    
                    <div className="site-layout-background" id="splash-layout-background">

                        <div id="splash-text">
                            <h1>Visualize Music</h1>
                            <h3>Create, customize, and share playlists.</h3>
                            <a href="/register">
                                <Button type="primary" size="large" id="splash-button">SIGN UP</Button>
                            </a>
                        </div>

                        
                        <div>
                            <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                                <defs>
                                    <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />

                                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%" > 
                                        <stop offset="0%" stopColor="rgba(254, 128, 23, 0.6)">
                                            <animate attributeName="stop-color" values="rgba(254, 128, 23, 0.6); rgba(254, 219, 12, 0.6); rgba(254, 128, 23, 0.6)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                        <stop offset="100%" stopColor="rgba(254, 219, 12, 0.6)">
                                            <animate attributeName="stop-color" values="rgba(254, 219, 12, 0.6); rgba(254, 128, 23, 0.6); rgba(254, 219, 12, 0.6)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                    </linearGradient>

                                    <linearGradient id="logo-gradient2" x1="0%" y1="0%" x2="100%" y2="0%" > 
                                        <stop offset="0%" stopColor="rgba(199, 50, 251, 0.7)">
                                            <animate attributeName="stop-color" values="rgba(199, 50, 251, 0.7); rgba(238, 148, 53, 0.7); rgba(199, 50, 251, 0.7)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                        <stop offset="100%" stopColor="rgba(238, 148, 53, 0.7)">
                                            <animate attributeName="stop-color" values="rgba(238, 148, 53, 0.7); rgba(199, 50, 251, 0.7); rgba(238, 148, 53, 0.7)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                    </linearGradient>

                                    <linearGradient id="logo-gradient3" x1="0%" y1="0%" x2="100%" y2="0%" > 
                                        <stop offset="0%" stopColor="rgba(254, 30, 109, 0.7)">
                                            <animate attributeName="stop-color" values="rgba(254, 30, 109, 0.7); rgba(254, 103, 58, 0.7); rgba(254, 30, 109, 0.7)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                        <stop offset="100%" stopColor="rgba(254, 103, 58, 0.7)">
                                            <animate attributeName="stop-color" values="rgba(254, 103, 58, 0.7); rgba(254, 30, 109, 0.7); rgba(254, 103, 58, 0.7)" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                    </linearGradient>

                                    <linearGradient id="logo-gradient4" x1="0%" y1="0%" x2="100%" y2="0%" > 
                                        <stop offset="0%" stopColor="#b023d9">
                                            <animate attributeName="stop-color" values="#b023d9; #941dc7; #b023d9" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                        <stop offset="100%" stopColor="#941dc7">
                                            <animate attributeName="stop-color" values="#941dc7; #b023d9; #941dc7" dur="4s" repeatCount="indefinite"></animate>
                                        </stop>
                                    </linearGradient>

                                </defs>
                                <g class="parallax">
                                    <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(254, 219, 12, 0.1)" />
                                    <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(254, 30, 109, 0.1)" />
                                    <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(254, 219, 12, 0.1)" />
                                    <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(255, 84, 144, 0.1)" />
                                </g>
                            </svg>
                        </div>

                    </div>


                </Content>

            </Layout>
        );
    }
}
