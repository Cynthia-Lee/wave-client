import React, { useEffect, useContext } from 'react';
import { Layout, Avatar, Tooltip } from "antd";
import Sidebar from "../../components/sidebar/Sidebar";
import TopBar from "../../components/top_bar/TopBar";
import Widget from "../../components/widget/Widget";
import ContentRow from "../../components/content_row/ContentRow";
import './AudioVisualScreen.css';

import { GlobalContext } from "../../GlobalState";

const { Header, Content, Sider, Footer } = Layout;

function AudioVisualScreen() {

    const [{ context, source, currentSong }, dispatch] = useContext(
        GlobalContext
    );

    useEffect(() => {
        if (currentSong && source) {
            playSong(currentSong.id);
        }else{
            //console.log("time to clean up");
            clearCanvas();
        }
    }, [currentSong, source]);

    function clearCanvas(){
        let canvas = document.getElementById("viz");
        let ctx = canvas.getContext("2d");
        function clear(){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            requestAnimationFrame(clear);
        }
        clear();
    }

    function playSong(id) {
        let canvas = document.getElementById("viz");
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        let ctx = canvas.getContext("2d");

        let analyser = context.createAnalyser();

        source.connect(analyser);
        //analyser.connect(context.destination);


        /////////////// ANALYSER FFTSIZE ////////////////////////
        // analyser.fftSize = 32;
        // analyser.fftSize = 64;
        // analyser.fftSize = 128;
        // analyser.fftSize = 256;
        // analyser.fftSize = 512;
        // analyser.fftSize = 1024;
        // analyser.fftSize = 2048;
        // analyser.fftSize = 4096;
        // analyser.fftSize = 8192;
        analyser.fftSize = 16384;
        // analyser.fftSize = 32768;

        // (FFT) is an algorithm that samples a signal over a period of time
        // and divides it into its frequency components (single sinusoidal oscillations).
        // It separates the mixed signals and shows what frequency is a violent vibration.

        // (FFTSize) represents the window size in samples that is used when performing a FFT

        // Lower the size, the less bars (but wider in size)
        ///////////////////////////////////////////////////////////


        let bufferLength = analyser.frequencyBinCount; // (read-only property)
        // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
        // Equates to number of data values you have to play with for the visualization

        // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
        // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

        let dataArray = new Uint8Array(bufferLength); // Converts to 8-bit unsigned integer array
        // At this point dataArray is an array with length of bufferLength but no values
        console.log('DATA-ARRAY: ', dataArray) // Check out this array of frequency values!

        let WIDTH = canvas.width;
        let HEIGHT = canvas.height;
        console.log('WIDTH: ', WIDTH, 'HEIGHT: ', HEIGHT)

        let barWidth = (WIDTH / bufferLength) * 13;
        console.log('BARWIDTH: ', barWidth)

        console.log('TOTAL WIDTH: ', (99 * 10) + (100 * barWidth)) // (total space between bars)+(total width of all bars)
        canvas.width = (99 * 10) + (100 * barWidth);

        let barHeight;
        let x = 0;

        function renderFrame() {
            requestAnimationFrame(renderFrame); // Takes callback function to invoke before rendering

            x = 0;

            analyser.getByteFrequencyData(dataArray); // Copies the frequency data into dataArray
            // Results in a normalized array of values between 0 and 255
            // Before this step, dataArray's values are all zeros (but with length of 8192)

            ctx.fillStyle = "#383838"; // Clears canvas before rendering bars (black with opacity 0.2)
            ctx.fillRect(0, 0, WIDTH, HEIGHT); // Fade effect, set opacity to 1 for sharper rendering of bars

            let bars = 100 // Set total number of bars you want per frame

            let gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
            //console.log(dataArray);
            gradient.addColorStop(0.4, currentSong.colors[0]);
            gradient.addColorStop(1, currentSong.colors[1]);

            for (let i = 0; i < bars; i++) {
                barHeight = (dataArray[i] * (HEIGHT / 255));

                // if (i === 0){
                //   console.log(dataArray[i])
                // }

                ctx.fillStyle = gradient;
                ctx.fillRect(x, (HEIGHT - barHeight), barWidth, barHeight);
                // (x, y, i, j)
                // (x, y) Represents start point
                // (i, j) Represents end point

                x += barWidth + 10 // Gives 10px space between each bar
            }
        }
        renderFrame();
    }

    return (
        <Layout>
            <Sider><Sidebar active={"audiovisual"}></Sidebar></Sider>

            <Layout>

                <Header style={{ zIndex: 1, width: "100%" }}>
                    <TopBar></TopBar>
                </Header>

                <Content className="content info-pic" style={{ textAlign: "center" }}>
                    <Avatar size={200} shape="square" src={currentSong ? currentSong.thumbnail : ""}></Avatar>
                    
                    <Tooltip placement="top" title={<div dangerouslySetInnerHTML={currentSong ? { __html: currentSong.title } : { __html: "" }}></div>}>
                        <h1 className="song-name"><div className="elip" dangerouslySetInnerHTML={currentSong ? { __html: currentSong.title } : { __html: "" }}></div></h1>
                    </Tooltip>
                    <h1><div className="elip" dangerouslySetInnerHTML={currentSong ? { __html: currentSong.channelTitle } : { __html: "" }}></div></h1>

                    <canvas id='viz'></canvas>

                </Content>
            </Layout>
        </Layout>
    );
}

export default AudioVisualScreen;