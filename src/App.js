//npm package//import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
import { BrowserRouter, Switch, Route, /*Link, useRouteMatch*/ } from 'react-router-dom';
//import GlobalStyles from 'src/components/GlobalStyles';
//import theme from 'src/theme';

import { Layout } from "antd";

import SplashScreen from "./screens/splash_screen/SplashScreen";
import LoginScreen from "./screens/login_screen/LoginScreen";
import RegisterScreen from "./screens/register_screen/RegisterScreen";
import UserLibraryScreen from "./screens/UserLibraryScreen";
import SearchScreen from "./screens/search_screen/SearchScreen";
import LikedContentScreen from "./screens/LikedContentScreen";
import SongHistoryScreen from "./screens/SongHistoryScreen";
import SettingsScreen from "./screens/settings_screen/SettingsScreen";
import UserProfileScreen from "./screens/user_profile_screen/UserProfileScreen";
import SongInfoScreen from "./screens/song_info_screen/SongInfoScreen";
import AudioVisualScreen from "./screens/audio_visual_screen/AudioVisualScreen";
import PlaylistInfoScreen from "./screens/playlist_info_screen/PlaylistInfoScreen";
import EditPlaylistScreen from "./screens/edit_playlist_screen/EditPlaylistScreen";

import { AuthProvider } from './context/auth';
import AuthRoute from './util/AuthRoute';
import UnAuthRoute from './util/UnAuthRoute';

import AuthWidget from './components/widget/AuthWidget';
import ErrorPage from './components/error_page/ErrorPage';
import { GlobalState } from "./GlobalState";

import "./index.css";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function App() {
  return (
    <GlobalState>
      <AuthProvider>
        <BrowserRouter>
          <Layout className="site-layout">
              <Switch>
                <AuthRoute exact path="/" component={SplashScreen} />
                <AuthRoute exact path="/login" component={LoginScreen} />
                <AuthRoute exact path="/register" component={RegisterScreen} />
                <UnAuthRoute path="/library" component={UserLibraryScreen} />
                <UnAuthRoute path="/search" component={SearchScreen} />
                <UnAuthRoute path="/likedContent" component={LikedContentScreen} />
                <UnAuthRoute path="/history" component={SongHistoryScreen} />
                <UnAuthRoute path="/settings" component={SettingsScreen} />
                <UnAuthRoute exact path="/profile/:username" component={UserProfileScreen} />
                <UnAuthRoute exact path="/song/:songId" component={SongInfoScreen} />
                <UnAuthRoute path="/audioVisual" component={AudioVisualScreen} />
                <UnAuthRoute exact path="/playlist/:playlistId" component={PlaylistInfoScreen} />
                <UnAuthRoute exact path="/edit/:playlistId" component={EditPlaylistScreen} />
                <Route path="*" component={ErrorPage} />
              </Switch>
            <AuthWidget/>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </GlobalState>
  );
}

/*
//<Route path="/users"><Users /></Route>
function Users() {
  // build nested routes and links using match.url and match.path.
  let match = useRouteMatch();

  return (
    <div>
      <nav>
        <Link to={`${match.url}/me`}>My Profile</Link>
      </nav>

      <Switch>
        <Route path={`${match.path}/me`}><OwnUserProfile /></Route>
        <Route path={`${match.path}/:id`}><UserProfile /></Route>
      </Switch>
    </div>
  );
}
*/

export default App;
