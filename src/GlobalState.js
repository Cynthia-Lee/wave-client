import React, { useReducer } from "react";

export const GlobalContext = React.createContext();

const initialState = {
  currentSong: null,
  context: new AudioContext(),
  source: null,
  playing: false,
  currentPlaylist: null
  //themeSelectValue: "Default"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setCurrentSong":
      return {
        ...state,
        currentSong: action.snippet
      };
    case "setContext":
      return {
        ...state,
        context: action.snippet
      };
    case "setSource":
      return {
        ...state,
        source: action.snippet
      }
    case "setPlaying":
      return {
        ...state,
        playing: action.snippet
      }
    case "setCurrentPlaylist":
      return {
        ...state,
        currentPlaylist: action.snippet
      }
    default:
      return state;
  }
};

export const GlobalState = props => {
  const globalState = useReducer(reducer, initialState);
  return (
    <GlobalContext.Provider value={globalState}>
      {props.children}
    </GlobalContext.Provider>
  );
};